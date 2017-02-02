ReactDOM.render(
	<ul>
	{
		names.map(function(name)
		{
			return <li>{name}</li>;
		})
	}
	</ul>,
	document.getElementById("root"));