import {inject} from 'aurelia-framework';
import {Service} from "./service";
import {Router} from 'aurelia-router';

@inject(Router, Service)
export class List {
    // data = [];
    // info = { page: 1, keyword: '' };
    context = ["detail"];
    columns = [
      { field: "code", title: "Kode" },
      { field: "symbol", title: "Simbol" },
      { field: "description", title: "Keterangan" },
    ]

    loader = (info) => {
      var order = {};
      if (info.sort)
        order[info.sort] = info.order;

      var arg = {
        page: parseInt(info.offset / info.limit, 10) + 1,
        size: info.limit,
        keyword: info.search,
        select:["code","symbol","description"],
        order: order
      }

      return this.service.search(arg)
        .then(result => {
          return {
            total: result.info.total,
            data: result.data
          }
        });
    }

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.uomId = "";
        this.uoms = [];
    }

    contextCallback(event) {
      var arg = event.detail;
      var data = arg.data;
      switch(arg.name) {
        case "detail":
        this.router.navigateToRoute('view', {id: data._id});
        break;
      }
    }
    
    view(data) {
        this.router.navigateToRoute('view', { id: data._id });
    } 

    upload() {
        this.router.navigateToRoute('upload');
    }
}
