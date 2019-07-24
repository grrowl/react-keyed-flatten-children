/* Returns React children into an array, flattening fragments. */
import {
  ReactNode,
  ReactChild,
  Children,
  isValidElement,
  cloneElement
} from "react";
import { isFragment } from "react-is";

export default function flattenChildren(
  children: ReactNode,
  depth: number = 0,
  keys: (string | number)[] = []
) {
  return Children.toArray(children).reduce(
    (acc: ReactChild[], node: ReactNode, nodeIndex) => {
      if (isFragment(node)) {
        acc.push.apply(
          acc,
          flattenChildren(
            node.props.children,
            depth + 1,
            keys.concat(node.key || nodeIndex)
          )
        );
      } else {
        if (isValidElement(node)) {
          acc.push(
            cloneElement(node, {
              key: `${keys.join(".")}.${node.key}`
            })
          );
        } else if (typeof node === "string" || typeof node === "number") {
          acc.push(node);
        }
      }
      return acc;
    },
    []
  );
}
