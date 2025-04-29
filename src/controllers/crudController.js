class CrudController {
    constructor(model) {
        this.model = model;
    }

    create = async(req, res, next) => {
        const entity = new this.model(req.body);
        await entity.save();
        req.entity = entity;
        res.status(201).json(entity);
    }

    getAll = async(req, res, next) => {
        const entities = await this.model.find(req.query);
        res.status(200).send(entities);
    }

    getOne = async(req, res, next) => {
        const entity = await this.model.findById(req.params.id);
        res.status(200).send(entity);
    }

    update = async(req, res, next) => {
        await this.model.findByIdAndUpdate(req.params.id, req.body);
        res.status(204).end();
    }

    delete = async(req, res, next) => {
        const entity = await this.model.findById(req.params.id);
        await entity.delete();
        res.status(204).end();
    }
}

module.exports = CrudController;