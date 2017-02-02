var MyTitle = React.createClass(
{
	getDefaultProps: function()
	{
		return { title: "Hello World" };
	},

	propTypes:
	{
		title: React.PropTypes.string
	},

	render: function()
	{
		return <h1>{this.props.title}</h1>;
	}
});