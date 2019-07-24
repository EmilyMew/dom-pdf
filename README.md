# dom-pdf

Convert HTML DOM Element to PDF. You can save a specified element as PDF File, print it directly, or preview as PDF.

Work by '996', sick in ICU. Keep your work-life balance, be a developer with happiness!
<p>
  <a href="https://996.icu">
    <img src="https://img.shields.io/badge/link-996.icu-red.svg" alt="996.icu" />
  </a>
  <a href="https://github.com/996icu/996.ICU/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-Anti%20996-blue.svg" alt="996.icu" />
  </a>
  <a href="https://github.com/EmilyMew/dom-pdf/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" />
  </a>
</p>

## Install

`npm install --save dom-pdf`

## Usage

To use Printer class:

```
import { Printer } from 'dom-pdf';

const printer = new Printer();

printer.init(element, options).then(() => {
  printer.print();
  printer.preview();
  printer.save();
});
```
To use Vue plugin:

```
import { VuePlugin } from 'dom-pdf';

Vue.use(VuePlugin);
```
In your Vue component:
```
this.$print(element, options);
this.$previewPDF(element, options);
this.$savePDF(element, options);
```

## Options

| Option                  | Description                                                                                           |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| orientation             | Paper orientation. Valid values: ['portrait', 'landscape']. Defaultly set to 'portrait'.              |
| pageSize                | Paper size Valid values: ['a0' ~ 'a10', 'b0' ~ 'b10', 'c0' ~ 'c10', 'dl', 'letter', 'government-letter' 'legal' 'junior-legal' 'ledger' 'tabloid' 'credit-card']. Defaultly set to 'a4'.                                                          |
| pageMargin              | Page margin.  Defaultly set to 30.                                                                    |
| scale                   | Scale. Defaultly set to 2.                                                                            |