import { Request, Response } from 'express';
import RefreshCountriesController from './refreshCountriesController';
import GetCountriesController from './getCountriesController';
import GetCountryByNameController from './getCountryByNameController';
import DeleteCountryByNameController from './deleteCountryByNameController';
import GetStatusController from './getStatusController';
import GetSummaryImageController from './getSummaryImageController';

export class CountryController {
    private refreshCountriesController: RefreshCountriesController;
    private getCountriesController: GetCountriesController;
    private getCountryByNameController: GetCountryByNameController;
    private deleteCountryByNameController: DeleteCountryByNameController;
    private getStatusController: GetStatusController;
    private getSummaryImageController: GetSummaryImageController;

    constructor() {
        this.refreshCountriesController = new RefreshCountriesController();
        this.getCountriesController = new GetCountriesController();
        this.getCountryByNameController = new GetCountryByNameController();
        this.deleteCountryByNameController = new DeleteCountryByNameController();
        this.getStatusController = new GetStatusController();
        this.getSummaryImageController = new GetSummaryImageController();
    }

    // Delegate methods to individual controllers
    public refreshCountries = (req: Request, res: Response) => this.refreshCountriesController.refreshCountries(req, res);
    public getCountries = (req: Request, res: Response) => this.getCountriesController.getCountries(req, res);
    public getCountryByName = (req: Request, res: Response) => this.getCountryByNameController.getCountryByName(req, res);
    public deleteCountryByName = (req: Request, res: Response) => this.deleteCountryByNameController.deleteCountryByName(req, res);
    public getStatus = (req: Request, res: Response) => this.getStatusController.getStatus(req, res);
    public getSummaryImage = (req: Request, res: Response) => this.getSummaryImageController.getSummaryImage(req, res);
}

export default CountryController;
