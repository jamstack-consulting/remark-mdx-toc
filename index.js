import { toc } from "mdast-util-toc";
import { map } from "unist-util-map";
import pluck from "remark-pluck";

// WHAT THIS DOES:

// make a table of contents.
// map the table of contents replacing
// each of the elements with an MDX alternative
// so they can be replaced in the normal MDX component mapping.

export const remarkMdxToc = (options = {}) => {
  const transformToMdx = (node) => {
    if (node.type === "list") {
      return {
        ...node,
        type: "mdxJsxFlowElement",
        name: "TableOfContents.List",
      };
    }
    if (node.type === "listItem") {
      return {
        ...node,
        type: "mdxJsxFlowElement",
        name: "TableOfContents.Item",
      };
    }

    if (node.type === "link") {
      return {
        ...node,
        type: "mdxJsxFlowElement",
        name: "TableOfContents.Link",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "href",
            value: node.url,
          },
        ],
      };
    }

    return node;
  };
  return (tree) => {
    const table = toc(tree, options).map;

    const mdxTable = {
      type: "mdxJsxFlowElement",
      name: "TableOfContents.Container",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "className",
          value: "remark-plugin page-outline",
        },
      ],
      children: table ? [map(table, transformToMdx)] : [],
    };

    const content = {
      type: "mdxJsxFlowElement",
      name: "div",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "className",
          value: "remark-plugin page-content",
        },
      ],
      children: tree.children,
    };

    // // I have no need for the p tags.
    // // this was crucial in understanding this part https://unifiedjs.com/learn/recipe/remove-node/
    // // I should turn this into a util find-and-pluck or something to remove a node but keep the children.
    // visit(mdxTable, { type: "paragraph" }, (node, index, ancestor) => {
    //   ancestor.children.splice(index, 1, ...node.children);
    //   return [SKIP, index];
    // });

    pluck(mdxTable, { type: "paragraph" });

    tree.children = [mdxTable, content];
  };
};

export default remarkMdxToc;
