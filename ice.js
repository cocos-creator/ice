var Express = require('express');
var BodyParser = require('body-parser');

var Nomnom = require('nomnom');
var Glob = require('glob');

var Path = require('path');
var Spawn = require('child_process').spawn;

// var Socket = require('socket.io');

var version = '0.0.1';
var app = Express();
var port = 5050;
var cwd = process.cwd();
var clientRoot = Path.join(cwd, 'client');
var taskInfos = {};

// ============================
// usage
// ============================

app.use(BodyParser.json()); // for parsing application/json
app.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// ============================
// requests
// ============================

app.get('/', function (req, res) {
    res.sendFile( Path.join(clientRoot, 'index.html') );
});

app.get('/gulp/tasks', function (req, res) {
    var tasks = [];
    for ( var p in taskInfos ) {
        if ( taskInfos.hasOwnProperty(p) ) {
            tasks.push(taskInfos[p]);
        }
    }

    res.json(tasks);
});

// serves all the static files
app.get(/^(.+)$/, function (req, res) {
    res.sendFile( Path.join(cwd, req.params[0]) );
});

app.put('/gulp/build/:taskName', function (req, res) {
    var fullTaskName = req.body.name + '@' + req.body.path;
    console.log( 'Start building %s...', fullTaskName );

    var cmdStr = process.platform === 'win32' ? 'gulp.cmd' : 'gulp';
    var gulppath = Path.join( cwd, opts.path, req.body.path );

    var child = Spawn(cmdStr, [req.body.name], {
        cwd: gulppath,
        stdio: [
            process.stdin,
            process.stdout,
            process.stderr,
        ],
    });
    // child.stdout.on('data', function ( data ) {
    //     console.log( data.toString().trim() );
    // });
    // child.stdout.pipe(res);

    child.on('exit', function () {
        console.log('Finish building %s.', fullTaskName);
        res.jsonp(req.body);
    });
});

// ============================
// error handling
// ============================

app.use(function (err, req, res, next) {
    console.error(err.stack);
    next(err);
});

app.use(function (err, req, res, next){
    if ( req.xhr ) {
        res.status(err.status || 500).send({ error: err.message });
    }
    else {
        next(err);
    }
});

app.use(function (req, res) {
    res.status(404).send({ error: "404 Error." });
});

// ============================
// start the server
// ============================

process.on('uncaughtException', function (err) {
    switch (err.code) {
    case 'EADDRINUSE':
        console.error( 'Error: The listening port ' + port + ' is in used' );
        break;

    default:
        console.error(err);
        break;
    }
});

function functionName (fn) {
    if ( !fn )
        return 'null';

    var ret = fn.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));

    return ret;
}

function parseArgv( argv ) {
    Nomnom
    .script("ice")
    .option('version', { abbr: 'v', flag: true, help: 'Print the version.',
            callback: function () { return version; } })
    .option('help', { abbr: 'h', flag: true, help: 'Print this usage message.' })
    .option('path', { help: "The path to start searching gulpfile." })
    .option('recursively', { abbr: 'r', flag: true, help: 'Search gulpfile recursively.' })
    ;

    return Nomnom.parse(argv);
}

function loadTasks( opts, cb ) {
    var dest = Path.resolve(cwd,opts.path);
    console.log( 'Loading gulp tasks from %s', dest );

    var currentDir = '';

    // this make sure our require use same gulp module
    var Gulp = require(Path.join( dest, 'node_modules', 'gulp'));
    var originalTaskFn = Gulp.Gulp.prototype.task;
    Gulp.Gulp.prototype.task = function (name, deps, fn) {
        var info = {};
        if ( typeof deps === 'function' ) {
            info = {
                name: name,
                deps: [],
                fn: functionName(deps),
                path: currentDir,
            };
        }
        else {
            info = {
                name: name,
                deps: deps,
                fn: functionName(fn),
                path: currentDir,
            };
        }

        taskInfos[name+'@'+info.path] = info;
    };

    var src = 'gulpfile.js';
    if ( opts.recursively ) {
        src = '**/gulpfile.js';
    }

    Glob( src, {
        cwd: dest,
        ignore: [
            '**/node_modules/**',
            '**/ext/**',
            '**/bower_components/**',
            '**/bin/**'
        ],
    }, function ( err, files ) {
        if ( err ) {
            throw err;
        }

        for ( var i = 0; i < files.length; ++i ) {
            var file = files[i];
            console.log('Parsing ' + file );

            currentDir = Path.dirname(file);
            var gulpfile = Path.join( dest, file );
            require (gulpfile);
            delete require.cache[require.resolve(gulpfile)];
        }

        Gulp.Gulp.prototype.task = originalTaskFn;
        console.log('Finish loading!');

        cb();
    });
}

var opts = parseArgv ( process.argv.slice(1) );
loadTasks(opts, function ( err ) {
    app.listen ( port, function () {
        console.log('Start listening on port %d', port);
    });
});
