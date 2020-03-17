import {
  inject,
  bindable,
  BindingEngine
} from "aurelia-framework";
import {
  Router
} from "aurelia-router";
import {
  Service
} from "./service";
import moment from 'moment';
var OrderLoader = require("../../../loader/weaving-order-loader");
var OperatorLoader = require("../../../loader/weaving-operator-loader");
var MachineLoader = require("../../../loader/weaving-machine-loader");
var BeamLoader = require("../../../loader/weaving-sizing-beam-loader");

@inject(Service, Router, BindingEngine)
export class Create {
  @bindable readOnly;
  @bindable OrderDocument;
  @bindable BeamOrigin;
  @bindable TyingMachineNumber;
  @bindable LoomMachineNumber;
  @bindable TyingOperator;
  @bindable LoomOperator;
  @bindable BeamDocument;
  @bindable PreparationTime;
  @bindable LoomBeamsUsed;

  columns = [{
    value: "BeamNumber",
    header: "No. Beam"
  }, {
    value: "TyingMachineNumber",
    header: "No. Mesin Tying"
  }, {
    value: "TyingOperator",
    header: "Operator Tying"
  }, {
    value: "TyingOperatorGroup",
    header: "Grup Tying"
  }, {
    value: "LoomMachineNumber",
    header: "No. Mesin Loom"
  }, {
    value: "LoomOperator",
    header: "Operator Tying"
  }, {
    value: "LoomOperatorGroup",
    header: "Grup Loom"
  }, {
    value: "OperationDate",
    header: "Tanggal"
  }, {
    value: "OperationTime",
    header: "Jam"
  }, {
    value: "Shift",
    header: "Shift"
  }, {
    value: "Process",
    header: "Proses"
  }, {
    header: "Action"
  }];

  beamOrigins = ["REACHING", "TYING"];
  process = ["Normal", "Reproses"];

  constructor(service, router, bindingEngine) {
    this.router = router;
    this.service = service;
    this.bindingEngine = bindingEngine;

    this.data = {};
    this.error = {};

    this.showHideAddBeam = false;
    this.LoomBeamsUsed = [];
  }

  formOptions = {
    cancelText: 'Kembali',
    saveText: 'Simpan',
  };

  loomBeamsUsedTableOptions = {

  }

  get orders() {
    return OrderLoader;
  }

  get operators() {
    return OperatorLoader;
  }

  get machines() {
    return MachineLoader;
  }

  get beams() {
    return BeamLoader;
  }

  OrderDocumentChanged(newValue) {
    if (newValue) {
      let order = newValue;

      this.LoomBeamsUsed.splice(0, this.LoomBeamsUsed.length);
      this.loomBeamsUsedTableOptions.OrderId = order.Id;

      if (newValue.ConstructionNumber) {
        this.error.ConstructionNumber = "";
        this.ConstructionNumber = newValue.ConstructionNumber;
      } else {
        this.ConstructionNumber = "";
        this.error.ConstructionNumber = " Nomor Konstruksi Tidak Ditemukan ";
      }

      if (newValue.Unit) {
        this.error.WeavingUnit = "";
        this.WeavingUnit = newValue.Unit;
      } else {
        this.WeavingUnit = "";
        this.error.WeavingUnitDocument = " Unit Weaving Tidak Ditemukan ";
      }

      if (newValue.WarpOriginOne) {
        this.error.WarpOriginOne = "";
        this.WarpOriginOne = newValue.WarpOriginOne;
      } else {
        this.WarpOriginOne = "";
        this.error.WarpOriginOne = " Asal Lusi Tidak Ditemukan "
      }

      if (newValue.WeftOriginOne) {
        this.error.WeftOriginOne = "";
        this.WeftOriginOne = newValue.WeftOriginOne;
      } else {
        this.WeftOriginOne = "";
        this.error.WeftOriginOne = " Asal Pakan Tidak Ditemukan "
      }
    }
  }

  showBeamMenu() {
    // this.TyingMachineNumber = null;
    // this.TyingOperator = null;
    // this.LoomMachineNumber = null;
    // this.LoomOperator = null;
    // this.PreparationDate = null;
    // this.PreparationTime = null;
    // this.PreparationShift = null;
    if (this.showHideAddBeam === true) {
      this.showHideAddBeam = false;
    } else {
      this.showHideAddBeam = true;
    }
  }

  BeamOriginChanged(newValue) {
    if (newValue === "TYING") {
      this.isTying = true;
    } else {
      this.isTying = false;
    }
  }

  PreparationTimeChanged(newValue) {
    this.PreparationTime = newValue;
    this.service.getShiftByTime(newValue)
      .then(result => {
        this.error.PreparationShift = "";
        this.PreparationShift = {};
        this.PreparationShift = result;
        this.data.PreparationShift = this.PreparationShift.Id;
      })
      .catch(e => {
        this.PreparationShift = {};
        this.error.PreparationShift = " Shift tidak ditemukan ";
      });
  }

  clearField(){
    this.TyingMachineDocument = undefined;
    this.TyingOperatorDocument = undefined;
    this.LoomMachineDocument = undefined;
    this.LoomOperatorDocument = undefined;
    this.PreparationDate = undefined;
    this.PreparationTime = undefined;
    this.PreparationShift = undefined;
    this.error.PreparationShift = undefined;
    this.BeamDocument = undefined;
  }

  addBeam() {
    let beamUsed = {};
    if (this.BeamOrigin === "TYING") {
      if (this.TyingMachineDocument) {
        beamUsed.TyingMachineId = this.TyingMachineDocument.Id;
        beamUsed.TyingMachineNumber = this.TyingMachineDocument.MachineNumber;
      } else {
        this.error.TyingMachineNumberId = "No. Mesin Tying Harus Diisi";
      }

      if (this.TyingOperatorDocument) {
        beamUsed.TyingOperatorId = this.TyingOperatorDocument.Id;
        beamUsed.TyingOperator = this.TyingOperatorDocument.Username;
        beamUsed.TyingOperatorGroup = this.TyingOperatorDocument.Group;
      } else {
        this.error.TyingOperatorId = "Operator Tying Harus Diisi";
      }
    }
    if (this.LoomMachineDocument) {
      beamUsed.LoomMachineId = this.LoomMachineDocument.Id;
      beamUsed.LoomMachineNumber = this.LoomMachineDocument.MachineNumber;
    } else {
      this.error.LoomMachineNumberId = "No. Mesin Loom Harus Diisi";
    }

    if (this.LoomOperatorDocument) {
      beamUsed.LoomOperatorId = this.LoomOperatorDocument.Id;
      beamUsed.LoomOperator = this.LoomOperatorDocument.Username;
      beamUsed.LoomOperatorGroup = this.LoomOperatorDocument.Group;
    } else {
      this.error.LoomOperatorId = "Operator Loom Harus Diisi";
    }

    if (this.BeamDocument) {
      beamUsed.BeamNumber = this.BeamDocument.Number;
      beamUsed.BeamProcessedId = this.BeamDocument.Id;
    } else {
      this.error.LoomBeamId = "No. Beam Harus Diisi";
    }

    if (this.PreparationDate) {
      beamUsed.PreparationDate = this.PreparationDate;
    } else {
      this.error.PreparationDate = "Tanggal Harus Diisi";
    }

    if (this.PreparationTime) {
      beamUsed.PreparationTime = this.PreparationTime;
    } else {
      this.error.PreparationTime = "Jam Harus Diisi";
    }

    if (this.PreparationShift) {
      beamUsed.PreparationShiftId = this.PreparationShift.Id;
      beamUsed.PreparationShiftName = this.PreparationShift.Name;
    } else {
      this.error.PreparationShift = "Jam Harus Diisi";
    }

    if (this.Process) {
      beamUsed.Process = this.Process;
    } else {
      this.error.Process = "Proses Harus Diisi";
    }
    
    this.LoomBeamsUsed.push(beamUsed);

    this.clearField();
  }

  saveCallback(event) {
    var preparationData = {};
    preparationData.LoomBeamProducts = [];
    preparationData.LoomBeamHistories = [];
    if (this.OrderDocument) {
      preparationData.OrderDocumentId = this.OrderDocument.Id;
    }

    this.LoomBeamsUsed.forEach(doc => {
      var BeamHistoryDocument = {};
      var BeamProductDocument = {};

      BeamProductDocument.BeamOrigin = doc.BeamOrigin;
      BeamProductDocument.BeamDocumentId = doc.BeamDocument.ReachingBeamId;
      BeamProductDocument.CombNumber = doc.CombNumber;
      BeamProductDocument.MachineDocumentId = doc.MachineDocument.Id;
      BeamProductDocument.DateBeamProduct = doc.Date;
      BeamProductDocument.TimeBeamProduct = doc.Time;
      BeamProductDocument.LoomProcess = doc.LoomProcess;

      BeamHistoryDocument.BeamNumber = doc.BeamDocument.ReachingBeamNumber;
      BeamHistoryDocument.MachineNumber = doc.MachineDocument.MachineNumber;
      BeamHistoryDocument.OperatorDocumentId = doc.OperatorDocument.Id;
      BeamHistoryDocument.DateMachine = doc.Date;
      BeamHistoryDocument.TimeMachine = doc.Time;
      BeamHistoryDocument.ShiftDocumentId = doc.Shift.Id;
      BeamHistoryDocument.Information = doc.Information;

      preparationData.LoomBeamProducts.push(BeamProductDocument);
      preparationData.LoomBeamHistories.push(BeamHistoryDocument);
    });

    this.service
      .create(preparationData)
      .then(result => {
        this.router.navigateToRoute('list');
      })
      .catch(e => {
        this.error = e;
        if (this.error.LoomBeamProducts || this.error.LoomBeamHistories) {
          this.showHideCollectionError = true;
        }
      });
  }

  cancelCallback(event) {
    this.router.navigateToRoute('list');
  }
}
