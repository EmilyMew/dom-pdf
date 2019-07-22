/*
 * $Id:$
 * Copyright 2018 Emily36107@outlook.com All rights reserved.
 */
import html2PDF from './util/pdf';
/**
 * Printer.
 * 
 * @author Emily Wang
 * @since 2019.07.02
 */
export default class Printer {
  /**
   * constructor
   */
  constructor() {
    let iframe = document.getElementById('dom-printer');
    if (iframe === null) {
      iframe = document.createElement('iframe');
      iframe.id = 'dom-printer';
      iframe.style.display = 'none';
    } else {
      document.body.removeChild(iframe);
    }
    this.iframe = iframe;
    this.iframe = iframe;
    this.pdf = null;
  }

  /**
   * init.
   * 
   * @param {Element} element element to print.
   * @param {Object} options
   *  - orientation print orientation
   *  - pageSize print page size
   *  - pageMargin print page margin
   *  - scale print scale
   */
  init(element, { orientation = 'portrait', pageSize = 'a4', pageMargin = 30, scale = 2 } = { orientation: 'portrait', pageSize: 'a4', pageMargin: 30, scale: 2 }) {
    this.element = element;
    return html2PDF(element, { orientation, pageSize, pageMargin, scale }).then(pdf => {
      this.pdf = pdf;
    });
  }

  /**
   * print method.
   */
  print() {
    const blobUrl = this.pdf.output('bloburl');
    this.iframe.src = blobUrl;
    document.body.appendChild(this.iframe);
    this.iframe.contentWindow.print();
  }

  /**
   * preview method.
   */
  preview() {
    const blobUrl = this.pdf.output('bloburl');
    window.open(blobUrl);
  }
};
