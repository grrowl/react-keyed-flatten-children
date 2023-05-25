import test from "tape";
import flattenChildren from "./index";
import TestRenderer, { ReactTestRendererTree } from "react-test-renderer";
import React, { Fragment, FunctionComponent, ReactNode } from "react";
import { isElement } from "react-is";

const Assert: FunctionComponent<{
  assert: (result: ReturnType<typeof flattenChildren>) => void;
  children: ReactNode
}> = (props: any) => {
  const result = flattenChildren(props.children);
  props.assert(result);
  return <div>{result}</div>;
};

function getRenderedChildren(rendererTree: ReactTestRendererTree | null) {
  if (!rendererTree || !rendererTree.rendered) throw new Error("No render");

  // if rendered is an array, return the array of children from each tree
  if (Array.isArray(rendererTree.rendered)) {
    return rendererTree.rendered.reduce((acc: Array<any>, tree: ReactTestRendererTree) => {
      if (tree.props && tree.props.children) {
        return acc.concat(tree.props.children);
      } else {
        throw new Error("No rendered props.children in one of the trees");
      }
    }, []);
  }

  // if rendered is a single tree
  if (!rendererTree.rendered.props || !rendererTree.rendered.props.children)
    throw new Error("No rendered props.children");


  return rendererTree.rendered.props.children as Array<any>;
}

test("simple children", function(t) {
  t.plan(5);

  TestRenderer.create(
    <Assert
      assert={result => {
        // this inner function tests the return value of flattenChildren
        t.equal(result.length, 4, "array length");

        t.equal(
          isElement(result[0]) && result[0].key,
          ".0",
          "0th element key"
        );
        t.equal(result[1], "two", "1st text child");
        t.equal(
          isElement(result[2]) && result[2].key,
          ".2",
          "2nd element key"
        );
        t.equal(result[3], "10", "3rd number child");
      }}
    >
      {/* these are our elements */}
      <span>one</span>
      two
      <span>three</span>
      10
    </Assert>
  );
});

test("conditional children", function(t) {
  t.plan(4);

  TestRenderer.create(
    <Assert
      assert={result => {
        t.equal(result.length, 3, "array length");

        t.equal(
          isElement(result[0]) && result[0].key,
          ".0",
          "0th element key"
        );
        t.equal(
          isElement(result[1]) && result[1].key,
          ".2",
          "2nd element key"
        );
        t.equal(
          isElement(result[2]) && result[2].key,
          ".4",
          "4th element key"
        );
      }}
    >
      <span>one</span>
      {false}
      <span>three</span>
      {null}
      <span>five</span>
    </Assert>
  );
});

test("keyed children", function(t) {
  t.plan(2);

  TestRenderer.create(
    <Assert
      assert={result => {
        t.equal(result.length, 5, "array length");
        t.deepEqual(
          result.map((c: any) => c.key),
          [".$one", ".$two", undefined, ".$four", ".4"],
          "element keys"
        );
      }}
    >
      <span key="one">one</span>
      <span key="two">two</span>
      three
      <span key="four">four</span>
      <span>five</span>
    </Assert>
  );
});

test("fragment children", function(t) {
  t.plan(2);

  TestRenderer.create(
    <Assert
      assert={result => {
        t.equal(result.length, 3, "array length");
        t.deepEqual(
          result.map((c: any) => c.key),
          [".0..$one", ".0..$two", ".1..$three"],
          "element keys"
        );
      }}
    >
      <>
        <span key="one">one</span>
        <span key="two">two</span>
      </>
      <>
        <span key="three">three</span>
      </>
    </Assert>
  );
});

test("keyed fragment children", function(t) {
  t.plan(2);

  TestRenderer.create(
    <Assert
      assert={result => {
        t.equal(result.length, 3, "array length");
        t.deepEqual(
          result.map((c: any) => c.key),
          [".$apple..$one", ".$apple..$two", ".$banana..$three"],
          "element keys"
        );
      }}
    >
      <Fragment key="apple">
        <span key="one">one</span>
        <span key="two">two</span>
      </Fragment>
      <Fragment key="banana">
        <span key="three">three</span>
      </Fragment>
    </Assert>
  );
});

test("array children", function(t) {
  t.plan(2);

  TestRenderer.create(
    <Assert
      assert={result => {
        t.equal(result.length, 5, "array length");
        t.deepEqual(
          result.map((c: any) => c.key),
          [".0", undefined, ".1:$apple", ".1:2", ".2"],
          "element keys"
        );
      }}
    >
      <span>one</span>
      {["two", <span key="apple">three</span>, <span>four</span>]}
      <span>five</span>
    </Assert>
  );
});

test("renders through to react", function(t) {
  t.plan(3);

  const result = TestRenderer.create(
    <Assert
      assert={result => {
        t.equal(result.length, 6, "array length");
      }}
    >
      <span>head</span>
      <Fragment key="apple">
        <span key="one">one</span>
        <span key="two">two</span>
      </Fragment>
      <span>body</span>
      {false}
      <Fragment key="banana">
        <span key="three">three</span>
      </Fragment>
      <span>foot</span>
    </Assert>
  ).toTree();

  // and this tests that the array returned by flattenChildren will be rendered
  // correctly by React
  const children = getRenderedChildren(result);

  t.equal(children.length, 6, "props.children.length");
  t.deepEqual(
    children.map((c: any) => c.key),
    [".0", ".$apple..$one", ".$apple..$two", ".2", ".$banana..$three", ".5"],
    "element keys"
  );
});
