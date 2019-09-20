import { RestService } from '../../../utils/rest-service';

const serviceUri = 'cutting-outs';
const cuttingInUri = 'cutting-ins';
const preparingServiceUri = 'preparings';
const costCalculationServiceUri = 'cost-calculation-garments';
const gComodityServiceUri = 'master/garment-comodities';
const uomServiceUri = 'master/uoms'

class Service extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "garment-production");
    }

    search(info) {
        var endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }

    create(data) {
        var endpoint = `${serviceUri}`;
        return super.post(endpoint, data);
    }

    read(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.get(endpoint);
    }

    update(data) {
        var endpoint = `${serviceUri}/${data.Id}`;
        return super.put(endpoint, data);
    }

    delete(data) {
        var endpoint = `${serviceUri}/${data.Id}`;
        return super.delete(endpoint, data);
    }

    getCuttingIn(info) {
        var endpoint = `${cuttingInUri}/complete`;
        return super.list(endpoint, info);
    }
}

class SalesService extends RestService {
    constructor(http, aggregator, config, api) {
        super(http, aggregator, config, "sales");
    }

    getCostCalculationByRONo(info) {
        var endpoint = `${costCalculationServiceUri}`;
        return super.list(endpoint, info);
    }
}

class CoreService extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "core");
    }

    getGComodity(info) {
        var endpoint = `${gComodityServiceUri}`;
        return super.list(endpoint, info);
    }

    getUom(info) { 
        var endpoint = `${uomServiceUri}`;
        return super.list(endpoint, info);
    }
}

export { Service, SalesService, CoreService }