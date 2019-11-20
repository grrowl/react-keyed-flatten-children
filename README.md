# react-keyed-flatten-children

Similar to [React's built-in `Children.toArray` method](https://reactjs.org/docs/react-api.html#reactchildrentoarray), this utility takes children and returns them as an array for introspection or filtering. Different from `toArray`, it will ensure element keys are unique, preserved, and stable between renders, and traverses into fragments and maintains their keys, too.

## getting started

```
npm install react-keyed-flatten-children
```

```
yarn add react-keyed-flatten-children
```

## why?

From the documentation of Children.toArray:

> Returns the children opaque data structure as a flat array with keys assigned to each child. Useful if you want to manipulate collections of children in your render methods, especially if you want to reorder or slice this.props.children before passing it down.

Unfortunately it has some thorny edges:

- [Children.toArray does not return a flat array of all children](https://github.com/facebook/react/issues/6889), skipping Fragments by design.
- Existing solutions exist, but they do not key the children, so you throw away valuable baked-in performance optimisations provided through stable keys.
- You're probably doing something a little wild anyway, so you want the concept of "children" to as predictable as possible for you, and for the consumers of your library or component, [to avoid issues like this down the line](https://github.com/ReactTraining/react-router/issues/5785#issuecomment-351067856).

### for library authors

`react-keyed-flatten-children` is a drop-in replacement for `Children.toArray`. In this example, instead of needing to rely on the child's array index, we can reference the key:

```jsx
import flattenChildren from "react-keyed-flatten-children";

const MenuList = ({ children }) => {
  const [selectedKey, setSelectedKey] = useState(null);

  return (
    <div role="menu">
      {flattenChildren(props.children).map(child => {
        if (child.type === MenuItem) {
          return React.cloneElement(child, {
            selected: child.key === selectedKey,
            onClick: () => setSelectedKey(child.key)
          });
        }
        return child;
      })}
    </div>
  );
};
```

Now consumers can use arrays, fragments, or conditionally render items and your library will continue to work predictably.

```jsx
<MenuList>
  <h2>Animals</h2>
  <MenuItem>Dogs</MenuItem>
  <MenuItem>Cats</MenuItem>

  <h2>Cars</h2>
  {CARS_ARRAY.map(car => (
    <MenuItem>{car}</MenuItem>
  ))}

  {isLoggedIn() && (
    <>
      <h2>User</h2>
      <MenuItem>You!</MenuItem>
      <MenuItem>Someone else!</MenuItem>
    </>
  )
</MenuList>
```

### for everyone else

Work around libraries which don't support fragments passed into children.

```jsx
import flattenChildren from "react-keyed-flatten-children";
import { Switch, Route } from "react-router";

// A <Switch> looks through its children <Routes>, but won't match <Routes> within fragments.
// <FlexibleSwitch> will flatten out its children so <Switch> is able to see all children.
const FlexibleSwitch = ({ children }) => (
  <Switch>{flattenChildren(children)}</Switch>
);

const AppRoutes = ({ user }) => (
  <Router>
    <GlobalNavigation user={user} />
    <Switch>
      <Route path="/about">
        <About />
      </Route>
      {user && (
        <>
          <Route path="/users">
            <Users />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
        </>
      )}
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  </Router>
);
```

## license

MIT
