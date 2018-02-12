import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";
import moment from 'moment';
var UnitLoader = require('../../../../loader/unit-loader');
var weeklyLoader = require('../../../../loader/garment-master-plan-weekly-plan-loader');
var weekLoader = require('../../../../loader/garment-master-plan-weekly-plan-by-year-loader');
var MasterPlanComodityLoader = require('../../../../loader/garment-master-plan-comodity-loader');

const resource = 'weekly-plans-by-year';
const shResource = 'standard-hours-by-buyer-comodity'
export class Item {
  @bindable selectedUnit;
  @bindable selectedWeeklyPlan;
  @bindable selectedWeek;
  @bindable selectedComodity;

  async activate(item) {
    this.data = item.data;
    this.error = item.error;
    this.options = item.options;
    this.buyerCode = item.context.options.buyerCode || "";
    this.context = item.context;

    this.items = [];
    for (var a = 0; a < this.context.items.length; a++) {
      this.items.push(this.context.items[a].data);
    }
    
    // console.log(this.data.code);
    // console.log(this.items[this.context.items.length-1].code);
    if (this.data.unit)
      this.selectedUnit = this.data.unit;
    if (this.data.weeklyPlanYear)
      this.selectedWeeklyPlan = { year: this.data.weeklyPlanYear.toString() };
    if (this.data.week) {
      if (!this.data.remainingEH) {
        this.data.remainingEH = this.data.week.remainingEH;
      }
      //console.log(this.data.week)
      this.selectedWeek = { items: this.data.week };
      //this.selectedWeek = {items:this.data.week};
      var config = Container.instance.get(Config);
      var endpoint = config.getEndpoint("garment-master-plan");
      var filter = {
        year: this.data.weeklyPlanYear,
        unit: this.data.unit.code,
        weekNumber: this.data.week.weekNumber
      }

      if (this.data._createdDate) {
        await endpoint.find(resource, { filter: JSON.stringify(filter) })
          .then((result) => {
            this.selectedWeek = result.data[0];
            this.data.week = this.selectedWeek.items;
            this.data.remainingEH = this.data.week.remainingEH;// + this.data.ehBooking;
            //let cat = this.data.weeklyPlanYear.toString() + this.data.unit.code.toString() + this.data.week.weekNumber.toString();
            // var uniq= this.items.find(x=>x.weeklyPlanYear.toString() + x.unit.code.toString() + x.week.weekNumber.toString()==cat);
            // if (uniq) {
            //   let y = this.items.lastIndexOf(uniq);
            //   if (y != this.items.length - 1) {
            //     this.data.remainingEH = this.items[y].sisaEH;
            //   }
            for (var a = this.items.length-1; a >=0; a--) {
                if(this.data.weeklyPlanYear==this.items[a].weeklyPlanYear && this.data.unit.code==this.items[a].unit.code&& this.data.week.weekNumber==this.items[a].week.weekNumber){
                  this.data.remainingEH+=this.items[a].ehBooking;
                  if(this.data.code==this.items[a].code){
                      break;
                  }
                }
              
              
            }
            if (this.data.week) {
              if (!this.data.efficiency) {
                this.data.efficiency = this.data.week.efficiency;
              }
              if (!this.data.ehBooking) {
                this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
                this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
              }
              else {
                this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;

              }
              this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
            }
          });
      }


    }
    if (this.data.masterPlanComodityId)
      this.selectedComodity = this.data.masterPlanComodity;
  }

  controlOption = {
    control: {
      length: 12
    }
  }

  @computedFrom("data.weeklyPlanYear")
  get filterYear() {
    var yearFilter = {};
    if (this.data.weeklyPlanYear && this.data.unit && this.data.unit.code) {
      yearFilter = {
        year: this.data.weeklyPlanYear,
        unit: this.data.unit.code
      }
    }
    return yearFilter;
  }


  @computedFrom("data.unit")
  get filterUnit() {
    var filter = {};
    if (this.data.unit && this.data.unit.code) {
      filter = {
        "unit.code": this.data.unit.code
      }
    }
    return filter;
  }

  selectedUnitChanged(newValue) {
    var _selectedData = newValue;
    if (_selectedData) {
      this.data.unitId = _selectedData._id;
      this.data.unit = _selectedData;
    } else {
      delete this.data.unitId;
      delete this.data.unit;
      this.selectedWeeklyPlan = {};
      this.selectedWeek = {};
    }
    delete this.data.weeklyPlanId;
    delete this.data.weeklyPlanYear;
    this.selectedWeeklyPlan = {};
    this.selectedWeek = {};
  }

  selectedWeeklyPlanChanged(newValue) {
    var _selectedData = newValue;
    if (_selectedData) {
      this.data.weeklyPlanYear = _selectedData.year;
      this.data.weeklyPlanId = _selectedData._id;
    }
    else {
      delete this.data.weeklyPlanId;
      delete this.data.weeklyPlanYear;
      this.selectedWeek = {};
    }
    var yearFilter = {};
    if (this.data.weeklyPlanYear && this.data.unit && this.data.unit.code) {
      yearFilter = {
        year: this.data.weeklyPlanYear,
        unit: this.data.unit.code
      }
    }
    //delete this.data.weeklyPlanId;
    //delete this.data.weeklyPlanYear;
    this.selectedWeek = {};
    this.data.ehBooking = 0;
    this.data.sisaEH = 0;
    this.data.planWorkingHours = 0;
  }

  selectedWeekChanged(newValue) {
    var _selectedData = newValue;
    if (_selectedData) {
      this.data.week = _selectedData.items;
      //this.selectedWeek=_selectedData.items;
      if (this.data.week) {
        //   if(!this.data.efficiency){

        //   }
        if (this.items.length > 1) {
          if (this.data.weeklyPlanYear && this.data.unit && this.data.week) {
            var unVal = [];
            for (var x of this.items) {
              let uniq = x.weeklyPlanYear.toString() + x.unit.code.toString() + x.week.weekNumber.toString();
              unVal.push(uniq);
            }
            unVal.pop();
            let cat = this.data.weeklyPlanYear.toString() + this.data.unit.code.toString() + this.data.week.weekNumber.toString();

            let dup = unVal.find(o => (o == cat));
            if (dup) {
              let y = unVal.lastIndexOf(dup);
              if (y != this.items.length - 1) {
                this.data.remainingEH = this.items[y].sisaEH;
              }
              else {

                this.data.remainingEH = this.data.week.remainingEH;
              }
            }
            else {

              this.data.remainingEH = this.data.week.remainingEH;
            }
          }
        }
        else {
          this.data.remainingEH = this.data.week.remainingEH;
        }
        this.data.efficiency = this.data.week.efficiency;
        this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
        this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
        this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
      }
    } else {
      delete this.data.week;
      this.selectedWeek = {};
      this.data.ehBooking = 0;
      this.data.sisaEH = 0;
      this.data.planWorkingHours = 0;
    }
  }

  quantityChanged(e) {
    if (this.data.quantity && this.data.week) {
      this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
      this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
      this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
    }
  }

  efficiencyChanged(e) {
    if (this.data.quantity && this.data.week) {
      this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
      this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
      this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
    }
  }

  SMVChanged(e) {
    if (this.data.quantity && this.data.week) {
      this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
      this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
      this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
    }
  }

  EHChanged(e) {
    if (this.data.quantity && this.data.week) {
      this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
      this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
      this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
    }
  }

  async selectedComodityChanged(newValue) {
    var _selectedData = newValue;
    if (_selectedData) {
      this.data.masterPlanComodityId = _selectedData._id;
      this.data.masterPlanComodity = _selectedData;
      var config = Container.instance.get(Config);
      var endpoint = config.getEndpoint("garment-master-plan");
      var filter = {
        buyerCode: this.buyerCode,
        comodityCode: _selectedData.code
      };
      await endpoint.find(shResource, { filter: JSON.stringify(filter) })
        .then((result) => {
          if (result.data.length > 0) {
            this.data.shSewing = result.data[0].firstSHSewing;
            if (this.data.quantity && this.data.week) {
              this.data.ehBooking = Math.round((this.data.shSewing * this.data.quantity) / 60);
              this.data.sisaEH = this.data.remainingEH - this.data.ehBooking;
              this.data.planWorkingHours = Math.round(this.data.ehBooking / this.data.week.operator);
            }
          }
          else {
            this.data.ehBooking = 0;
            this.data.sisaEH = 0;
            this.data.planWorkingHours = 0;
            this.data.shSewing = 0;
          }
        });
    }
  }

  get unitLoader() {
    return UnitLoader;
  }
  get weeklyloader() {
    return weeklyLoader;
  }
  get weekloader() {
    return weekLoader;
  }
  get masterPlanComodityLoader() {
    return MasterPlanComodityLoader;
  }

  get isFilterUnit() {
    return this.data && this.data.unitId;
  }

  get isFilterWeek() {
    return this.data && this.data.unitId && this.data.weeklyPlanYear;
  }

  get totalSH() {
    var total = (this.data.shCutting || 0) + (this.data.shSewing || 0) + (this.data.shFinishing || 0);
    return total;
  }

  weekView = (week) => {
    var returnData = ""
    if (week && week.items) {
      var endDate = moment(week.items.endDate).format("DD MMM YYYY");
      var startDate = moment(week.items.startDate).format("DD MMM YYYY");
      returnData = `W${week.items.weekNumber} - ${startDate} s/d ${endDate}`;
    }
    return returnData;
  }
}
