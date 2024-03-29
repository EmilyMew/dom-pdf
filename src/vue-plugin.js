/*
 * $Id:$
 * Copyright 2018 Emily36107@outlook.com All rights reserved.
 */
import Printer from './printer';

let printer = new Printer();

const mixins = {
  /**
   * print method.
   * 
   * @param {Element} element element to print.
   * @param {Object} options
   *  - orientation print orientation
   *  - pageSize print page size
   *  - pageMargin print page margin
   *  - scale print scale
   */
  $print: {
    value(element, { orientation = 'portrait', pageSize = 'a4', pageMargin = 30, scale = 2 } = { orientation: 'portrait', pageSize: 'a4', pageMargin: 30, scale: 2 }) {
      new Promise(resolve => {
        if (printer.element === element && printer.pdf) {
          resolve();
        } else {
          printer.init(element, { orientation, pageSize, pageMargin, scale }).then(resolve);
        }
      }).then(() => {
        this.$emit('pdf-generated');
        printer.print();
      }).catch(err => {
        this.$emit('pdf-generate-err', err);
      });
    }
  },

  /**
   * preview method.
   * 
   * @param {Element} element element to print.
   * @param {Object} options
   *  - orientation print orientation
   *  - pageSize print page size
   *  - pageMargin print page margin
   *  - scale print scale
   */
  $previewPDF: {
    value(element, { orientation = 'portrait', pageSize = 'a4', pageMargin = 30, scale = 2 } = { orientation: 'portrait', pageSize: 'a4', pageMargin: 30, scale: 2 }) {
      new Promise(resolve => {
        if (printer.element === element && printer.pdf) {
          resolve();
        } else {
          printer.init(element, { orientation, pageSize, pageMargin, scale }).then(resolve);
        }
      }).then(() => {
        this.$emit('pdf-generated');
        printer.preview();
      }).catch(err => {
        this.$emit('pdf-generate-err', err);
      });
    }
  },

  /**
   * save method.
   * 
   * @param {Element} element element to print.
   * @param {Object} options
   *  - orientation print orientation
   *  - pageSize print page size
   *  - pageMargin print page margin
   *  - scale print scale
   */
  $savePDF: {
    value(element, fileName, { orientation = 'portrait', pageSize = 'a4', pageMargin = 30, scale = 2 } = { orientation: 'portrait', pageSize: 'a4', pageMargin: 30, scale: 2 }) {
      new Promise(resolve => {
        if (printer.element === element && printer.pdf) {
          resolve();
        } else {
          printer.init(element, { orientation, pageSize, pageMargin, scale }).then(resolve);
        }
      }).then(() => {
        this.$emit('pdf-generated');
        printer.save(fileName);
      }).catch(err => {
        this.$emit('pdf-generate-err', err);
      });
    }
  }
};

const install = (Vue) => {
  Object.defineProperties(Vue.prototype, mixins);
};

export default {
  install
};
