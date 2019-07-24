# react-keyed-flatten-children

Flattens children, which may or may not be full of fragments, into an array, ensuring their keys are unique.

## why?

* [Children.toArray does not return a flat array of all children](https://github.com/facebook/react/issues/6889)
* Existing solutions exist, but they do not key the children, so you throw away valuable baked-in element stability which is provided through keys.
* You're probably doing something a little wild anyway, so you need "children" to be predictable for you, and for the consumers of your library or component.

https://reactjs.org/docs/react-api.html#reactchildrentoarray

> Returns the children opaque data structure as a flat array with keys assigned to each child. Useful if you want to manipulate collections of children in your render methods, especially if you want to reorder or slice this.props.children before passing it down.

this ensures nested fragments with keys maintain their keying
