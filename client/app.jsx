var Router = ReactRouter;

var SearchBox = React.createClass({
    handleKeyUp: function (e) {
        e.stopPropagation();
        this.props.onChange(e.target.value);
    },

    text: function () {
        return this.refs.input.getDOMNode().value;
    },

    render: function() {
        return (
            <div className="search-box">
                <input ref="input" type="text" placeholder="Search" onKeyUp={this.handleKeyUp} />
            </div>
        );
    }
});

var Tab = React.createClass({
    getInitialState: function() {
        return {
            active: this.props.active
        };
    },

    handleClick: function (e) {
        e.stopPropagation();

        this.props.onActive();
    },

    render: function() {
        return (
            <li onClick={this.handleClick} className={this.state.active ? 'active' : ''}>
                <h5>
                    {this.props.children}
                </h5>
            </li>
        );
    }
});

var Tabs = React.createClass({
    clear: function () {
        this.refs.all.setState({ active:  false });
        this.refs.search.setState({ active: false });
    },

    active: function ( tabName ) {
        if ( tabName === 'all' ) {
            this.activeAll();
        }
        else if ( tabName === 'search' ) {
            this.activeSearch();
        }
    },

    activeAll: function () {
        this.clear();
        this.refs.all.setState({ active: true });
        this.props.onChange('all');
    },

    activeSearch: function () {
        this.clear();
        this.refs.search.setState({ active: true });
        this.props.onChange('search');
    },

    render: function () {
        return (
            <ul className="tabs">
                <Tab active ref="all" onActive={this.activeAll}>All</Tab>
                <Tab ref="search" onActive={this.activeSearch}>Search</Tab>
            </ul>
        );
    }
});

var TaskItem = React.createClass({
    mixins: [Router.Navigation],

    handleClick: function (e) {
        e.stopPropagation();

        var url = '/task/' + this.props.data.name;
        if ( this.props.data.path !== '.' ) {
            url += '?path=' + this.props.data.path;
        }

        this.transitionTo(url);
    },

    render: function() {
        var href = "#/task/" + this.props.data.name;
        if ( this.props.data.path !== '.' ) {
            href += '?path=' + this.props.data.path;
        }

        var deps;
        if ( this.props.data.deps.length > 0 ) {
            var depItems = this.props.data.deps.map(function (name) {
                var depHref = "#/task/" + name;
                if ( this.props.data.path !== '.' ) {
                    depHref += '?path=' + this.props.data.path;
                }
                return <a href={depHref}>{name}</a>;
            }.bind(this));
            deps = <p className="desc">deps: {depItems}</p>
        }

        var tag;
        if ( this.props.data.path !== '.' ) {
            tag = <p className="desc right">
                    <span className="tag">{this.props.data.path}</span>
                  </p>
        }

        return (
            <li className="task-item" onClick={this.handleClick}>
                <a href={href}>
                    {this.props.data.name}
                </a>
                {deps}
                {tag}
            </li>
        );
    }
});

var TaskList = React.createClass({
    render: function() {
        var data = this.props.data.sort( function ( a, b ) {
            var key_a = a.name + '@' + a.path;
            var key_b = b.name + '@' + b.path;
            return key_a.localeCompare(key_b);
        });
        var tasks = data.filter(function (item) {
            if ( !this.props.filter )
                return true;

            var filter = this.props.filter.toLowerCase();
            if ( item.name.indexOf(filter) === -1 )
                return false;

            return true;
        }.bind(this)).map( function ( item ) {
            var key = item.name + '@' + item.path;
            return (
                <TaskItem key={key} data={item} />
            );
        });

        return (
            <ul>
                {tasks}
            </ul>
        );
    }
});

var TaskPanel = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            filter: ''
        };
    },

    componentDidMount: function() {
        $.ajax({
            url: "gulp/tasks",
            dataType: 'json',
            success: function ( data ) {
                // console.log('gulp/tasks returns: ', data);
                this.setState( { data: data } );
            }.bind(this),
            error: function ( xhr, status, err ) {
                console.error('gulp/tasks', status, err.toString());
            }
        });
    },

    filterChanged: function ( newValue ) {
        if ( newValue !== '' ) {
            this.refs.tabs.active('search');
        }
        else {
            this.refs.tabs.active('all');
        }
        this.setState({ filter: newValue });
    },

    tabChanged: function ( tabName ) {
        if ( tabName === 'all' ) {
            this.setState({ filter: '' });
        }
        else if ( tabName === 'search' ) {
            this.setState({ filter: this.refs.searchBox.text() });
        }
    },

    render: function() {
        return (
            <div className="panel flex-col">
                <SearchBox ref="searchBox" onChange={this.filterChanged}/>
                <Tabs ref="tabs" onChange={this.tabChanged}/>
                <div className="tab-content">
                    <TaskList data={this.state.data} filter={this.state.filter} />
                </div>
            </div>
        );
    }
});

var BoardPanel = React.createClass({
    mixins: [Router.State],

    handleBuild: function (e) {
        e.stopPropagation();

        $.ajax({
            url: "gulp/build/" + this.getParams().taskName,
            type: 'PUT',
            data: {
                name: this.getParams().taskName,
                path: this.getQuery().path
            },
            success: function ( data ) {
                console.log('gulp/build returns: ', data);
            }.bind(this),
            error: function ( xhr, status, err ) {
                console.error('gulp/build/', status, err.toString());
            }
        });
    },

    render: function() {
        return (
            <div className="panel board">
                <div className="header">
                    <h3>
                        {this.getParams().taskName}
                    </h3>
                    {this.getQuery().path}
                </div>
                <button onClick={this.handleBuild}>Build</button>
            </div>
        );
    }
});

var App = React.createClass({
    handleSelect: function(e) {
        console.log('handleSelect ', e.detail.data);
    },

    render: function() {
        return (
            <div className="app flex-row">
                <div id="tasks" className="left">
                    <TaskPanel />
                </div>
                <div id="board" className="right">
                    <RouteHandler />
                </div>
            </div>
        );
    }
});
