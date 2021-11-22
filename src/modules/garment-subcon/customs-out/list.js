import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import { AuthService } from "aurelia-authentication";
var moment = require("moment");

@inject(Router, Service,AuthService)
export class List {
    constructor(router, service, authService) {
        this.service = service;
        this.router = router;
        this.authService=authService;
    }

    filter={};
    activate(params) {
        let username = null;
        if (this.authService.authenticated) {
            const me = this.authService.getTokenPayload();
            username = me.username;
        }
        // this.filter={
        //   CreatedBy: username
        // }
      }

    context = ["Rincian"];

    columns = [
        { field: "CustomsOutNo", title: "No BC Keluar" },
        { field: "CustomsOutType", title: "Jenis BC Keluar" },
        { field: "SubconType", title: "Jenis Subcon" },
        { field: "SubconContractNo", title: "No Subcon Contract" },
        { field: "SupplierName", title: "Supplier" },
        { field: "CustomsOutDate", title: "Tgl BC Keluar", formatter: value => moment(value).format("DD MMM YYYY") },
        
    ]

    loader = (info) => {
        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
            filter:JSON.stringify(this.filter)
        }

        return this.service.search(arg)
            .then(result => {
                result.data.forEach(s => {
                    s.SupplierName=s.Supplier.Name;
                    
                });
                return {
                    total: result.info.total,
                    data: result.data,
                }
            });
    }

    contextClickCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Rincian":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}