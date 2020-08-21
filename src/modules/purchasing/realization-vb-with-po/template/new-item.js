import { bindable, computedFrom } from 'aurelia-framework';
const UnitPaymentOrderLoader = require('../../../../loader/spb-for-vb');
// const

export class NewItem {
  constructor() {
  }

  controlOptions = {
    label: {
      length: 4
    },
    control: {
      length: 5
    }
  }

  activate(context) {
    this.data = context.data;
    this.error = context.error;
    this.options = context.context.options;
    this.readOnly = context.options.readOnly;

    this.selectedUnitPaymentOrder = this.data.UnitPaymentOrder;
  }

  changeCheckBox() {
    this.context.context.options.checkedAll = this.context.context.items.reduce((acc, curr) => acc && curr.data.IsSave, true);
  }

  get unitPaymentOrderLoader() {
    return UnitPaymentOrderLoader;
  }

  @bindable selectedUnitPaymentOrder;
  selectedUnitPaymentOrderChanged(newValue, oldValue) {
    if (newValue) {
      this.data.UnitPaymentOrder = newValue;
    } else {
      delete this.data.UnitPaymentOrder;
    }
  }
}
