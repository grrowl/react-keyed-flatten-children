import { cleanup, render } from "@testing-library/react";
import "jsdom-global/register";
import React, { Fragment, FunctionComponent, ReactNode, version } from "react";
import { isElement } from "react-is";
import test from "tape";
import flattenChildren from "./index";

// React 19+ supports BigInt as children, React 18 does not
const REACT_MAJOR = parseInt(version.split(".")[0], 10);

const Assert: FunctionComponent<{
  assert: (result: ReturnType<typeof flattenChildren>) => void;
  children: ReactNode;
}> = (props) => {
  const result = flattenChildren(props.children);
  props.assert(result);
  return (
    <div data-testid="assert-container">
      {React.Children.map(result, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              "data-reactkey": child.key,
            } as React.HTMLAttributes<HTMLElement>)
          : child
      )}
    </div>
  );
};

function getRenderedChildren(container: HTMLElement) {
  const assertContainer = container.querySelector(
    '[data-testid="assert-container"]'
  );
  if (!assertContainer) throw new Error("No assert container found");
  return Array.from(assertContainer.children);
}

test("simple children", function (t) {
  t.plan(5);

  const { container } = render(
    <Assert
      assert={(result) => {
        // this inner function tests the return value of flattenChildren
        t.equal(result.length, 4, "array length");

        t.equal(isElement(result[0]) && result[0].key, ".0", "0th element key");
        t.equal(result[1], "two", "1st text child");
        t.equal(isElement(result[2]) && result[2].key, ".2", "2nd element key");
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

// BigInt rendering is only supported in React 19+.
// React 18's Children.toArray strips BigInts before flattenChildren sees them.
test("bigint children", function (t) {
  if (REACT_MAJOR >= 19) {
    t.plan(4);

    const { container } = render(
      <Assert
        assert={(result) => {
          t.equal(result.length, 4, "array length");
          t.equal(isElement(result[0]) && result[0].key, ".0", "0th element key");
          t.equal(result[1], 10n, "1st bigint child");
          t.equal(result[3], BigInt(20), "3rd BigInt() child");
        }}
      >
        <span>one</span>
        {10n}
        <span>two</span>
        {BigInt(20)}
      </Assert>
    );
  } else {
    // React 18: BigInts are filtered out by Children.toArray
    t.plan(2);

    const { container } = render(
      <Assert
        assert={(result) => {
          t.equal(result.length, 2, "array length (bigints filtered)");
          t.equal(isElement(result[0]) && result[0].key, ".0", "0th element key");
        }}
      >
        <span>one</span>
        {10n}
        <span>two</span>
        {BigInt(20)}
      </Assert>
    );
  }
});

test("bigint in nested fragments", function (t) {
  if (REACT_MAJOR >= 19) {
    t.plan(2);

    const { container } = render(
      <Assert
        assert={(result) => {
          t.equal(result.length, 1, "array length");
          t.equal(result[0], 100n, "nested bigint preserved");
        }}
      >
        <>
          <>{100n}</>
        </>
      </Assert>
    );
  } else {
    // React 18: BigInts are filtered out
    t.plan(1);

    const { container } = render(
      <Assert
        assert={(result) => {
          t.equal(result.length, 0, "array length (bigint filtered)");
        }}
      >
        <>
          <>{100n}</>
        </>
      </Assert>
    );
  }
});

test("nested arrays and fragments with mixed content", function (t) {
  t.plan(2);

  const { container } = render(
    <Assert
      assert={(result) => {
        t.equal(result.length, 8, "array length");
        t.deepEqual(
          result.map((c: any) => c.key),
          [
            ".0",
            undefined,
            ".1:$a",
            undefined,
            ".1:2:$b",
            undefined,
            undefined,
            ".2",
          ],
          "element keys"
        );
      }}
    >
      <span>start</span>
      {[
        "one",
        <span key="a">nested element</span>,
        ["two", <span key="b">deep element</span>, "three", 4],
      ]}
      <span>end</span>
    </Assert>
  );
});

test("conditional children", function (t) {
  t.plan(4);

  const { container } = render(
    <Assert
      assert={(result) => {
        t.equal(result.length, 3, "array length");

        t.equal(isElement(result[0]) && result[0].key, ".0", "0th element key");
        t.equal(isElement(result[1]) && result[1].key, ".2", "2nd element key");
        t.equal(isElement(result[2]) && result[2].key, ".4", "4th element key");
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

test("keyed children", function (t) {
  t.plan(2);

  const { container } = render(
    <Assert
      assert={(result) => {
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

test("fragment children", function (t) {
  t.plan(2);

  const { container } = render(
    <Assert
      assert={(result) => {
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

test("keyed fragment children", function (t) {
  t.plan(2);

  const { container } = render(
    <Assert
      assert={(result) => {
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

test("array children", function (t) {
  t.plan(2);

  const { container } = render(
    <Assert
      assert={(result) => {
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

test("renders through to react", function (t) {
  t.plan(3);

  const { container } = render(
    <Assert
      assert={(result) => {
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
  );

  const children = getRenderedChildren(container);

  t.equal(children.length, 6, "props.children.length");
  t.deepEqual(
    Array.from(children).map((child) => child.getAttribute("data-reactkey")),
    [".0", ".$apple..$one", ".$apple..$two", ".2", ".$banana..$three", ".5"],
    "element keys"
  );
});

test.onFinish(cleanup);
