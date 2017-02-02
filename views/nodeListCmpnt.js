var NodeList = React.createClass(
{
	render: function()
	{
		return (
			<ol>
				{
					React.Children.map(this.props.children, function(child)
					{
						return <li>{child}</li>;
					})
				}
			</ol>);
	}
});