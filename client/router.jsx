var Router = ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var NotFoundRoute = Router.NotFoundRoute;

var NotFound = React.createClass({
    render: function() {
        return (
            <h1>Not Found</h1>
        );
    }
});

var routes = (
    <Route path="/" handler={App}>
        <Route name="task" path="/task/:taskName" handler={BoardPanel}/>
    </Route>
);

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.body);
});
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//     React.render(<Handler/>, document.body);
// });
