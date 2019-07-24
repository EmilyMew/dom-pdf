/*
 * $Id:$
 * Copyright 2018 Emily36107@outlook.com All rights reserved.
 */
const isNotBlank = (str) => {
  return str && str.trim();
}
const isBlank = (str) => {
  return !isNotBlank(str);
}
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
    isNotBlank(dom.data) && styles.float !== 'none';
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
      if (isBlank(dom.data)) {
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
const getCombinedLeaves = (root) => {
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
    leaves.splice(leaves.indexOf(nodes[0]), nodes.length, paragraph);
  });
  return leaves;
};

/**
 * Get the previous margin bottom of specified element
 * 
 * @param {Element} element element to calculate layout
 * @param {*} ancestor root element
 */
const getPreviousMarginBottom = (element, ancestor) => {
  const styles = window.getComputedStyle(element);
  const paddingTop = parseFloat(styles.paddingTop);
  const borderTop = parseFloat(styles.borderTop);
  const calcPrevMargin = (isNaN(paddingTop) || paddingTop === 0) && (isNaN(borderTop) || borderTop === 0);
  if (element.previousElementSibling) {
    return calcPrevMargin ? parseFloat(window.getComputedStyle(element.previousElementSibling).marginTop) : 0;
  } else {
    return element === ancestor ? 0 : getPreviousMarginBottom(element.parentElement);
  }
};

/**
 * Add page divider before specified element.
 * 
 * @param {Element} root root element
 * @param {Element} options 
 *  - element specified element.
 *  - top top position of page spliter
 *  - marginHeight height of page spliter
 */
const addPageDivider = (root, { element, top, marginHeight }) => {
  const styles = window.getComputedStyle(element);
  const curMarginTop = parseFloat(styles.marginTop);
  if (styles.display === 'table-row') {
    const blankRow = document.createElement(element.tagName);
    if (element.tagName.toUpperCase() !== 'TR' || element.tagName.toUpperCase() !== 'TH') {
      blankRow.style.display = 'table-row';
    }
    blankRow.style.height = `${(isNaN(curMarginTop) ? 0 : curMarginTop) + marginHeight}px`;
    element.parentElement.insertBefore(blankRow, element);
  } else {
    const prevMarginBottom = getPreviousMarginBottom(element, root);
    element.style.marginTop = `${(isNaN(curMarginTop) ? 0 : curMarginTop) + prevMarginBottom + marginHeight}px`;
  }
  const pageSpliter = document.createElement('div');
  pageSpliter.style.position = 'absolute';
  pageSpliter.style.top = `${top}px`;
  pageSpliter.style.left = 0;
  pageSpliter.style.right = 0;
  pageSpliter.style.height = `${marginHeight}px`;
  pageSpliter.style.background = '#ffffff';
  root.appendChild(pageSpliter);
};

/**
 * Adjust element height according to heights and margins.
 * 
 * @param {Element|Node} root root node.
 * @param {Number} pageHeight height of every page.
 * @param {Number} pdfHeight height of every page in pdf.
 * @param {Number} pageMargin margin.
 */
const pageSplit = (root, pageHeight, pdfHeight, pageMargin) => {
  const leaf = getCombinedLeaves(root);
  const marginPixels = pageHeight / (pdfHeight - pageMargin * 2) * pageMargin;
  let totalBlankHeight = 0;
  let totalMarginHeight = 0;
  const executors = leaf.map(element => {
    const offset = getOffsetToAncestor(element, root);
    const restHeightOnPage = pageHeight - (offset.top + totalBlankHeight) % pageHeight;
    if (element.offsetHeight > restHeightOnPage) {
      return (resolve, reject) => {
        const top = offset.top + totalMarginHeight + totalBlankHeight;
        const marginHeight = restHeightOnPage + marginPixels * 2;
        const result = { element, top, marginHeight };
        totalBlankHeight += restHeightOnPage;
        totalMarginHeight += marginPixels * 2;
        resolve(result);
      };
    }
  }).filter(f => f !== null && f !== undefined);
  return Promise.queue(...executors).then(([...results]) => {
    results.forEach(option => {
      addPageDivider(root, option);
    });
  });
};

export default {
  getOffsetToAncestor,
  isBlockElement,
  getLeaves,
  pageSplit
};
