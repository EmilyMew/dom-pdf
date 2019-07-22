/*
 * $Id:$
 * Copyright 2018 Emily36107@outlook.com All rights reserved.
 */

/**
 * compute offset to an ancestor element.
 * 
 * @param {Element} element - element to compute offset
 * @param {Element} ancestor  - ancestor to compute offset
 */
const getOffsetToAncestor = (element, ancestor) => {
  const offset = {
    top: element.offsetTop,
    right: element.offsetRight,
    bottom: element.offsetBottom,
    left: element.offsetLeft
  };
  if (element.offsetParent !== ancestor) {
    const parentOffset = getOffsetToAncestor(element.offsetParent, ancestor);
    offset.top += parentOffset.top;
    offset.right += parentOffset.right;
    offset.bottom += parentOffset.bottom;
    offset.left += parentOffset.left;
  }
  if (isNaN(offset.right)) {
    offset.right = document.body.offsetWidth - offset.left - element.offsetWidth;
  }
  if (isNaN(offset.bottom)) {
    offset.bottom = document.body.offsetHeight - offset.top - element.offsetHeight;
  }
  return offset;
}

/**
 * Returns if an element is a block-level element.
 * 
 * @param {Element} dom html element
 * @returns  {Boolean} if an element is a block-level element.
 */
const isBlockElement = (dom) => {
  if (!(dom instanceof Element)) {
    return false;
  }
  const styles = window.getComputedStyle(dom);
  return styles.display === 'block' ||
    styles.display === 'table' || styles.display === 'flex' ||
    dom.data && dom.data.trim() && styles.float !== 'none';
};

/**
 * Returns the leaf-nodes for print.
 * 
 * @param {Element|Node} dom root node/element.
 * @returns  {Array<Node>} leaf-nodes for print.
 */
const getLeaves = (dom) => {
  const result = [];
  if (!(dom instanceof Comment)) {
    if (dom instanceof Text) {
      if (!dom.data || !dom.data.trim()) {
        return result;
      }
    }
    const children = Array.from(dom.childNodes);
    if (!children || !children.length) {
      result.push(dom);
    } else {
      const styles = window.getComputedStyle(dom);
      const hasBlockChildren = children.some(isBlockElement);
      if ((styles.display === 'flex' && styles.flexDirection === 'row') || !hasBlockChildren) {
        result.push(dom);
      } else if (styles.display === 'table-row') {
        result.push(dom);
      } else {
        children.forEach(child => {
          result.splice(result.length, 0, ...getLeaves(child));
        });
      }
    }
  }
  return result;
};

/**
 * Combine none-block-level siblings.
 * 
 * @param {Element|Node} root root node/element.
 */
const combineLeaves = (root) => {
  const leaves = getLeaves(root);
  const noneBlockNodes = leaves.reduce((accumulator, current) => {
    let inlineArray = accumulator[accumulator.length - 1];
    if (!isBlockElement(current)) {
      if (!inlineArray || !inlineArray[inlineArray.length - 1] || current.previousSibling !== inlineArray[inlineArray.length - 1]) {
        inlineArray = [];
        accumulator.push(inlineArray);
      }
      inlineArray.push(current);
    }
    return accumulator;
  }, []);
  noneBlockNodes.forEach(nodes => {
    const paragraph = document.createElement('p');
    nodes[0].parentElement.insertBefore(paragraph, nodes[0]);
    paragraph.append(...nodes);
  });
};

/**
 * Adjust element height according to heights and margins.
 * 
 * @param {Element|Node} root root node.
 * @param {Number} pageHeight height of every page.
 * @param {Number} pdfHeight height of every page in pdf.
 * @param {Number} pageMargin margin.
 */
const adjustHeight = (root, pageHeight, pdfHeight, pageMargin) => {
  combineLeaves(root);
  const leaf = getLeaves(root);
  const marginPixels = pageHeight / (pdfHeight - pageMargin * 2) * pageMargin;
  let totalMarginHeight = 0;
  const executors = leaf.map(l => {
    return (resolve, reject) => {
      const offset = getOffsetToAncestor(l, root);
      const top = offset.top - totalMarginHeight;
      const restHeightOnCurPage = pageHeight - top % pageHeight;
      if (l.offsetHeight > restHeightOnCurPage) {
        const styles = window.getComputedStyle(l);
        const curMarginTop = parseFloat(styles.marginTop);
        if (styles.display === 'table-row') {
          const blankRow = document.createElement(l.tagName);
          if (l.tagName.toUpperCase() !== 'TR') {
            blankRow.style.display = 'table-row';
          }
          blankRow.style.height = `${(isNaN(curMarginTop) ? 0 : curMarginTop) + restHeightOnCurPage + marginPixels * 2}px`;
          l.parentElement.insertBefore(blankRow, l);
        } else {
          l.style.marginTop = `${(isNaN(curMarginTop) ? 0 : curMarginTop) + restHeightOnCurPage + marginPixels * 2}px`;
        }
        totalMarginHeight += marginPixels * 2;
      }
      resolve();
    };
  });
  return Promise.queue(...executors);
};

export default {
  getOffsetToAncestor,
  isBlockElement,
  getLeaves,
  combineLeaves,
  getLeaveBlock,
  adjustHeight
};
