var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var router = express.Router();

var BacklogItem = mongoose.model('BacklogItem');
var User = mongoose.model('User');
var Project = mongoose.model('Project');
var UserStory = mongoose.model('UserStory');
var Sprint = mongoose.model('Sprint');

var BacklogItemValidator = require('./../validation/backlogItemValidator');

router.route('/projects/:project_id/backlogitems')

/**
 * @api {get} /projects/:project_id/backlogitems/ Get all backlogItems for one project.
 * @apiName GetBacklogItems
 * @apiGroup Backlog
 *
 * @apiParam {ObjectId} project_id Unique identifier of a project.
 *
 * @apiSuccess {BacklogItem[]} backlogitems List of backlogitems.
 * @apiSuccess {ObjectId} backlogitems._id Unique identifier of the backlogitem.
 * @apiSuccess {String} backlogitems.title The text of the backlogitem.
 * @apiSuccess {ObjectId} backlogitems.authorId Assigned author of the backlogitem
 * @apiSuccess {String} backlogitems.author Authorname of the backlogitem.
 * @apiSuccess {Date} backlogitems.creationDate CreationDate of the backlogitem.
 * @apiSuccess {ObjectId} backlogitems.assignedToId ID of assigned user.
 * @apiSuccess {String} backlogitems.assignedToDisplayName Name of assigned user.
 * @apiSuccess {Enum} backlogitems.state State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
 * @apiSuccess {String} backlogitems.description Description of the backlogitem.
 * @apiSuccess {ObjectId} backlogitems.sprintId Assigned sprint of the backlogitem.
 * @apiSuccess {ObjectId} backlogitems.projectId Assigned project of the backlogitem.
 * @apiSuccess {String} backlogitems.projectDisplayTitle Displaytitle for the assigned project.
 * @apiSuccess {Task[]} backlogitems.tasks List of tasks for the backlogitem.
 * @apiSuccess {Number} backlogitems.effort Effort in hours.
 * @apiSuccess {Number} backlogitems.priority Priority for backlogitem.
 * @apiSuccess {ObjectId} backllogitems.userStoryId ID of assigned userstory.
 * @apiSuccess {String} backlogitems.userStoryDisplayName Title of assigned userstory.
 * @apiSuccess {ObjectId[]} backlogitems.sprintIds Array of the assigned sprint IDs.
 * @apiSuccess {String[]} backlogitems.sprintDisplayNames Array of the names of the assigned sprints.
 * @apiSuccess {Enum} backlogitems.itemType Type of the backlogitem. Values: 'BacklogItem' 'Bug'.
 */
    .get(function (req, res) {
        var projectId = req.params.project_id;

        BacklogItem.find({projectId: projectId}, function (err, backlogItems) {
            if (err) {
                return res.send(err);
            }
            return res.json(backlogItems);
        });
    })

    /**
     * @api {post} /projects/:project_id/backlogitems/ Create a new backlogitem.
     * @apiName AddBacklogItem
     * @apiGroup Backlog
     *
     * @apiParam {ObjectId} project_id Unique identifier of a project.
     * @apiParam {String} title The text of the backlogitem.
     * @apiParam {ObjectId} authorId Assigned author of the backlogitem
     * @apiParam {ObjectId} [assignedToId] ID of assigned user.
     * @apiParam {Enum} [state] State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
     * @apiParam {String} [description] Description of the backlogitem.
     * @apiParam {ObjectId} [sprintId] Assigned sprint of the backlogitem.
     * @apiParam {Number} [effort] Effort in hours.
     * @apiParam {Number} [priority] Priority for backlogitem.
     * @apiParam {ObjectId} [userStoryId] ID of assigned userstory.
     * @apiParam {ObjectId} [sprintId] ID of assigned sprint.
     * @apiParam {Enum} [itemType] Type of the backlogitem. Values: 'BacklogItem' 'Bug'.
     *
     * @apiSuccess {ObjectId} _id Unique identifier of the backlogitem.
     * @apiSuccess {String} title The text of the backlogitem.
     * @apiSuccess {ObjectId} authorId Assigned author of the backlogitem
     * @apiSuccess {String} author Authorname of the backlogitem.
     * @apiSuccess {Date} creationDate CreationDate of the backlogitem.
     * @apiSuccess {ObjectId} assignedToId ID of assigned user.
     * @apiSuccess {String} assignedToDisplayName Name of assigned user.
     * @apiSuccess {Enum} state State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
     * @apiSuccess {String} description Description of the backlogitem.
     * @apiSuccess {ObjectId} sprintId Assigned sprint of the backlogitem.
     * @apiSuccess {ObjectId} projectId Assigned project of the backlogitem.
     * @apiSuccess {String} projectDisplayTitle Displaytitle for the assigned project.
     * @apiSuccess {Task[]} tasks List of tasks for the backlogitem.
     * @apiSuccess {Number} effort Effort in hours.
     * @apiSuccess {Number} priority Priority for backlogitem.
     * @apiSuccess {ObjectId} userStoryId ID of assigned userstory.
     * @apiSuccess {String} userStoryDisplayName Title of assigned userstory.
     * @apiSuccess {ObjectId[]} sprintIds Array of the assigned sprint IDs.
     * @apiSuccess {String[]} sprintDisplayNames Array of the names of the assigned sprints.
     * @apiSuccess {Enum} itemType Type of the backlogitem. Values: 'BacklogItem' 'Bug'.
     */
    .post(function (req, res) {

        var validator = new BacklogItemValidator();
        validator.validate(req, function (validationResult) {
            if (!validationResult.isValid()) {
                return res.status(460).send(validationResult.toResult());
            } else {
                var newBacklogItem = new BacklogItem();
                fillValues(req, res, newBacklogItem, true);
            }
        });
    });

router.route('/projects/:project_id/backlogitems/:id')

/**
 * @api {get} /projects/:project_id/backlogitems/:id Get existing backlogitem by ID.
 * @apiName GetBacklogItem
 * @apiGroup Backlog
 *
 * @apiParam {ObjectId} project_id Unique identifier of a project.
 * @apiParam {ObjectId} id Unique identifier of a backlogitem.
 *
 * @apiSuccess {ObjectId} _id Unique identifier of the backlogitem.
 * @apiSuccess {String} title The text of the backlogitem.
 * @apiSuccess {ObjectId} authorId Assigned author of the backlogitem
 * @apiSuccess {String} author Authorname of the backlogitem.
 * @apiSuccess {Date} creationDate CreationDate of the backlogitem.
 * @apiSuccess {ObjectId} assignedToId ID of assigned user.
 * @apiSuccess {String} assignedToDisplayName Name of assigned user.
 * @apiSuccess {Enum} state State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
 * @apiSuccess {String} description Description of the backlogitem.
 * @apiSuccess {ObjectId} sprintId Assigned sprint of the backlogitem.
 * @apiSuccess {ObjectId} projectId Assigned project of the backlogitem.
 * @apiSuccess {String} projectDisplayTitle Displaytitle for the assigned project.
 * @apiSuccess {Task[]} tasks List of tasks for the backlogitem.
 * @apiSuccess {Number} effort Effort in hours.
 * @apiSuccess {Number} priority Priority for backlogitem.
 * @apiSuccess {ObjectId} userStoryId ID of assigned userstory.
 * @apiSuccess {String} userStoryDisplayName Title of assigned userstory.
 * @apiSuccess {ObjectId[]} sprintIds Array of the assigned sprint IDs.
 * @apiSuccess {String[]} sprintDisplayNames Array of the names of the assigned sprints.
 * @apiSuccess {Enum} itemType Type of the backlogitem. Values: 'BacklogItem' 'Bug'.
 *
 */
    .get(function (req, res) {
        var id = req.params.id;
        var projectId = req.params.project_id;

        BacklogItem.findOne({_id: id, projectId: projectId}, function (err, backlogItem) {
            if (err) {
                console.error(err);
                return res.send(err);
            }
            if (!backlogItem) return res.status(200).json("Not Found!");

            return res.json(backlogItem);
        });
    })

    /**
     * @api {put} /projects/:project_id/backlogitems/:id Update an existing backlogitem.
     * @apiName UpdateBacklogItem
     * @apiGroup Backlog
     *
     * @apiParam {ObjectId} project_id Unique identifier of a project.
     * @apiParam {ObjectId} id Unique identifier of a backlogitem.
     * @apiParam {String} title The text of the backlogitem.
     * @apiParam {ObjectId} authorId Assigned author of the backlogitem
     * @apiParam {ObjectId} [assignedToId] ID of assigned user.
     * @apiParam {Enum} [state] State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
     * @apiParam {String} [description] Description of the backlogitem.
     * @apiParam {ObjectId} [sprintId] Assigned sprint of the backlogitem.
     * @apiParam {Number} [effort] Effort in hours.
     * @apiParam {Number} [priority] Priority for backlogitem.
     * @apiParam {ObjectId} [userStoryId] ID of assigned userstory.
     * @apiParam {ObjectId} [sprintId] ID of assigned sprint.
     * @apiParam {Enum} [itemType] Type of the backlogitem. Values: 'BacklogItem' 'Bug'.
     *
     * @apiSuccess {ObjectId} _id Unique identifier of the backlogitem.
     * @apiSuccess {String} title The text of the backlogitem.
     * @apiSuccess {ObjectId} authorId Assigned author of the backlogitem
     * @apiSuccess {String} author Authorname of the backlogitem.
     * @apiSuccess {Date} creationDate CreationDate of the backlogitem.
     * @apiSuccess {ObjectId} assignedToId ID of assigned user.
     * @apiSuccess {String} assignedToDisplayName Name of assigned user.
     * @apiSuccess {Enum} state State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
     * @apiSuccess {String} description Description of the backlogitem.
     * @apiSuccess {ObjectId} sprintId Assigned sprint of the backlogitem.
     * @apiSuccess {ObjectId} projectId Assigned project of the backlogitem.
     * @apiSuccess {String} projectDisplayTitle Displaytitle for the assigned project.
     * @apiSuccess {Task[]} tasks List of tasks for the backlogitem.
     * @apiSuccess {Number} effort Effort in hours.
     * @apiSuccess {Number} priority Priority for backlogitem.
     * @apiSuccess {ObjectId} userStoryId ID of assigned userstory.
     * @apiSuccess {String} userStoryDisplayName Title of assigned userstory.
     * @apiSuccess {ObjectId[]} sprintIds Array of the assigned sprint IDs.
     * @apiSuccess {String[]} sprintDisplayNames Array of the names of the assigned sprints.
     * @apiSuccess {Enum} itemType Type of the backlogitem. Values: 'BacklogItem' 'Bug'.
     *
     */
    .put(function (req, res) {
        var id = req.params.id;
        var projectId = req.params.project_id;

        var validator = new BacklogItemValidator();
        validator.validate(req, function (validationResult) {
            if (!validationResult.isValid()) {
                return res.status(460).send(validationResult.toResult());
            } else {
                BacklogItem.findOne({_id: id, projectId: projectId}, function (err, newBacklogItem) {//TODO: Prüfen ob Projekt auch abgefragt werden muss.
                    if (err) {
                        return res.send(err);
                    }
                    fillValues(req, res, newBacklogItem, false);
                });
            }
        });
    })

    /**
     * @api {delete} /projects/:project_id/backlogitem/:id Delete an existing backlogitem.
     * @apiName DeleteBacklogItem
     * @apiGroup Backlog
     *
     * @apiParam {ObjectId} project_id Unique identifier of a project.
     * @apiParam {ObjectId} id Unique identifier of the backlogitem.
     *
     */
    .delete(function (req, res) {
        var id = req.params.id;

        BacklogItem.findByIdAndRemove(id,
            function (err, res) {
                if (err) {
                    console.error(err);
                    return res.send(err);
                }
            });
        return res.status(200).json("Success");
    });


router.route('/projects/:project_id/backlogitems/:state')
    /**
     * @api {get} /projects/:project_id/backlogitems/:state Get all BacklogItem with a specific state.
     * @apiName GetBacklogItemByState
     * @apiGroup Backlog
     *
     * @apiParam {ObjectId} project_id Unique identifier of a project.
     * @apiParam {ObjectId} id Unique identifier of a backlogitem.
     * @apiParam {Enum} [state] State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
     *
     */
    .get(function (req, res) {
        var state = req.params.state;
        var projectId = req.params.project_id;

        BacklogItem.find({state: state, projectId: projectId}, function (err, backlogItem) {
            if (err) {
                console.error(err);
                return res.send(err);
            }
            if (!backlogItem) return res.status(200).json("Not Found!");

            return res.json(backlogItem);
        });
    });
router.route('/projects/:project_id/backlogitems/:backlogItem_id/:state')
    /**
     * @api {put} /projects/:project_id/backlogitems/:id/state Update state of an existing backlogitem.
     * @apiName UpdateBacklogItemState
     * @apiGroup Backlog
     *
     * @apiParam {ObjectId} project_id Unique identifier of a project.
     * @apiParam {ObjectId} id Unique identifier of a backlogitem.
     * @apiParam {Enum} [state] State of the backlogitem. Values: 'New' 'Approved' 'Committed' 'Done' 'Removed'.
     *
     */
    .put(function (req, res) {
        var projectId = req.params.project_id;
        var backlogItemId = req.params.backlogItem_id;
        var state = req.params.state;

        console.log("Update state of backlog item...");
        BacklogItem.findById(backlogItemId, function (err, backlogItem) {
            if (err) {
                return res.send(err);
            }
            backlogItem.state = state;
            backlogItem.save(function (err) {
                if (err) {
                    return res.send(err);
                }
                return res.status(200).json("Updated state successfully!");
            });
        });
    });

    /**
     * @api {get} /projects/:project_id/backlogitem/state Get all possible state values
     * @apiName GetStateValues
     * @apiGroup Backlog
     *
     * @apiParam {ObjectId} project_id Unique identifier of a project.
     *
     */
    router.get('/projects/:project_id/backlogitem/state', function (req, res) {
        return res.status(200).json({"state": ["New", "Approved", "Committed", "Done", "Removed"]});
    });


function fillValues(req, res, newBacklogItem, isNew) {
    var projectId = req.params.project_id;
    var authorId = req.body.authorId;
    var assignedToId = req.body.assignedToId;
    var userStoryId = req.body.userStoryId;
    var sprintId = req.body.sprintId;

    Project.findById(projectId, function (err, project) {
        if (err) {
            return res.send(err);
        }
        User.findById(authorId, function (err, author) {
            if (err) {
                return res.send(err);
            }
            User.findById(assignedToId, function (err, assignedTo) {
                if (err) {
                    return res.send(err);
                }
                Sprint.findById(sprintId, function (err, sprint) {
                    if (err) {
                        return res.send(err);
                    }
                    newBacklogItem.assignedToId = assignedToId;
                    if (assignedTo == undefined) {
                        newBacklogItem.assignedToDisplayName = undefined;
                    } else {
                        newBacklogItem.assignedToDisplayName = assignedTo.displayName();
                    }

                    newBacklogItem.userStoryId = userStoryId;
                    var userStory = project.userStories.id(userStoryId);
                    if (userStory == undefined) {
                        newBacklogItem.userStoryDisplayName = undefined;
                    } else {
                        newBacklogItem.userStoryDisplayName = userStory.title;
                    }

                    newBacklogItem.sprintId = req.body.sprintId;
                    if (sprint == undefined) {
                        newBacklogItem.sprintDisplayName = undefined;
                    } else {
                        newBacklogItem.sprintDisplayName = sprint.sprintName;
                    }


                    if (isNew) {
                        newBacklogItem.creationDate = moment();
                        newBacklogItem.itemType = req.body.itemType;

                        newBacklogItem.authorId = authorId;
                        newBacklogItem.authorDisplayName = author.displayName();

                        newBacklogItem.projectId = projectId;
                        newBacklogItem.projectDisplayTitle = project.displayName;
                    }

                    newBacklogItem.title = req.body.title;
                    newBacklogItem.state = req.body.state;
                    newBacklogItem.description = req.body.description;
                    newBacklogItem.priority = req.body.priority;
                    newBacklogItem.effort = req.body.effort;

                    newBacklogItem.save(function (err) {
                        if (err) {
                            console.error(err);
                            return res.send(err);
                        }
                        return res.json(newBacklogItem);
                    });

                });
            });
        });
    });
}

module.exports = router;