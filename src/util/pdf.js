/*
 * $Id:$
 * Copyright 2018 Emily36107@outlook.com All rights reserved.
 */
import JSPDF from 'jspdf';
import html2Canvas from 'html2canvas';

import dom from './dom';
/**
 * Get Adjusted pdf data.
 * 
 * @param {Element} element element to print.
 * @param {Object} options
 *  - orientation print orientation
 *  - pageSize print page size
 *  - pageMargin print page margin
 *  - scale print scale
 */
const html2PDF = (element, { orientation, pageSize, pageMargin, scale }) => {
  return new Promise((resolve, reject) => {
    const node = element.cloneNode(true);
    const container = document.createElement('div');
    element.parentElement.appendChild(container);
    container.appendChild(node);
    const pdf = new JSPDF(orientation, 'pt', pageSize);
    const pageWidth = pdf.internal.pageSize.width - pageMargin * 2;
    const pageHeight = element.offsetWidth / pageWidth * (pdf.internal.pageSize.height - pageMargin * 2);
    dom.pageSplit(node, pageHeight, pdf.internal.pageSize.height, pageMargin).then(() => {
      const _canvas = document.createElement('canvas');
      _canvas.getContext('2d').scale(scale, scale);
      _canvas.width = node.offsetWidth * scale;
      const opts = {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff',
        scale,
        canvas: _canvas
      };
      return html2Canvas(node, opts);
    }).then(canvas => {
      const imgHeight = pageWidth / canvas.width * canvas.height;
      let restHeight = canvas.height;
      let position = pageMargin;

      const img = canvas.toDataURL();
      if (restHeight < pageHeight) {
        pdf.addImage(img, 'PNG', pageMargin, position, pageWidth, imgHeight);
      } else {
        while (restHeight > 0) {
          pdf.addImage(img, 'PNG', pageMargin, position, pageWidth, imgHeight);
          restHeight -= pageHeight * scale;
          position -= pdf.internal.pageSize.height; //避免添加空白页 
          if (restHeight > 0) {
            pdf.addPage();
          }
        }
      }
      resolve(pdf);
    }).catch(err => {
      reject(err);
    }).finally(() => {
      element.parentElement.removeChild(container);
    });
  });
};

export default html2PDF;
