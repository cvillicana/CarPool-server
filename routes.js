var AuthenticationController  = require('./controllers/authentication'),
    TodoController            = require('./controllers/todos'),
    UploadService             = require('./services/uploadService'),
    express                   = require('express'),
    passportService           = require('./config/passport'),
    passport                  = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
    requireLogin = passport.authenticate('local', {session: false});

module.exports = function(app){

    var apiRoutes     = express.Router(),
        authRoutes    = express.Router(),
        serviceRoutes  = express.Router(),
        todoRoutes    = express.Router();

    // Auth Routes
    apiRoutes.use('/auth', authRoutes);
    authRoutes.get('/exists/:email', AuthenticationController.exists);
    authRoutes.post('/facebook', AuthenticationController.authFacebook);
    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);

    authRoutes.get('/protected', requireAuth, function(req, res){
        res.send({ content: 'Success'});
    });

    // Todo Routes
    apiRoutes.use('/todos', todoRoutes);

    todoRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['user','admin']), TodoController.getTodos);
    todoRoutes.post('/', requireAuth, AuthenticationController.roleAuthorization(['user','admin']), TodoController.createTodo);
    todoRoutes.delete('/:todo_id', requireAuth, AuthenticationController.roleAuthorization(['admin']), TodoController.deleteTodo);

    //Upload Routes
    apiRoutes.use('/service', serviceRoutes);

    serviceRoutes.post('/upload/:filename', UploadService.saveFile);

    // Set up routes
    app.use('/api', apiRoutes);

}
