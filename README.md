# dom-pdf

Convert HTML DOM Element to PDF. You can save a specified element as PDF File, print it directly, or preview as PDF.

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