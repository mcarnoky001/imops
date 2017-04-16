/*global PouchDB*/

define([
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/promise/Promise"
], function(declare) {

    var PouchStore = declare(null, {
        db: null,

        constructor: function(options) {
            for (var i in options) {
                this[i] = options[i];
            }
        },
        getAll: function(){
            db.allDocs({
        	  include_docs: true,
        	  attachments: true
        	}).then(function (result) {
        	  // handle result
        	}).otherwise(function (err) {
        	  console.log(err);
        	});
        },
        getIdentity: function(item) {
            return item._id;
        },
        getCompanies : function(){
            return this.db.query('company/employer').then(function(response) {
                return response.rows.map(function(item) {
                    return item.value;
                });
            });
        },
        getCompanyEmployees : function(item){
            return this.db.query('company/employee', {
        	key:item
            }).then(function(response) {
                return response.rows.map(function(item) {
                    return item.value;
                });
            });
        },
        login : function(name,pass){
            return this.db.query('login/login', {
            	key: [name,pass]
            }).then(function(response) {
                 return response.rows.map(function(item) {
                     return item.value;
                 });
           });
        },
        query: function(param) {
            return this.db.query('contacts/contacts', {
                group: false
            }).then(function(response) {
                return response.rows.map(function(item) {
                    return item.value;
                });
            }).otherwise(function(err) {
                console.log(err);
            });
        },

        get: function(id) {
            return this.db.get(id);
        },

        add: function(item) {
            return this.db.post(item)
                .then((function(response) {
                    return this.get(response.id);
                }).bind(this));
        },

        put: function(item) {
            return this.db.put(item)
                .then((function() {
                    return this.get(item._id); // return updated document
                }).bind(this));
        },
        remove: function(item) {
            return this.db.remove(item);
        },
        getDefaultSkills: function(item) {
            return this.db.query('contacts/contacts', {
                group: true
            }).then(function(res) {
                for (var i = 0; i < res.rows.length; i++) {
                    res.rows[i].old = true;
                };
                console.log(res);
                return res;
            }).otherwise(function(err) {
                console.log(err);
            });
        },
        getNotZeroSkillDocs: function(item) {
            return this.db.query('contacts/contacts', {
                group: false
            }).then(function(response) {
                return response.rows.map(function(item) {
                    var _skills = [];
                    for (var i = 0; i < item.value.skills.length; i++) {
                        if (item.value.skills[i].value != 0) {
                            _skills.push(item.value.skills[i]);
                        }
                    };
                    item.value.skills = _skills;

                    return item.value;
                });
            }).otherwise(function(err) {
                console.log(err);
            });
        },
        getUserByIdWithSkillFilter: function(id) {
            return this.db.get(id).then(function(response) {
                var _skills = [];
                for (var i = 0; i < response.skills.length; i++) {
                    if (response.skills[i].value != 0) {
                        _skills.push(response.skills[i]);
                    }
                };
                response.skills = _skills;
                return response;
            }).otherwise(function(err) {
                console.log(err);
            });

        },
        filter: function(filterParams) {
            return this.db.query('contacts/contacts', {
                group: false
            }).then(function(response) {
                var result = [];
                for (var k = 0; k < response.rows.length; k++) {
                    if (filterParams.name !== "") {
                        if (response.rows[k].value.firstName !== filterParams.name) {
                            continue;
                        }
                    }
                    if (filterParams.surname !== "") {
                        if (response.rows[k].value.surname !== filterParams.surname) {
                            continue;
                        }
                    }
                    if (filterParams.skills.length > 0) {
                        var flag = true;
                        for (var j = 0; j < filterParams.skills.length; j++) {
                            if (flag == true) {
                                flag = false;
                                for (var i = 0; i < response.rows[k].value.skills.length; i++) {
                                    if (response.rows[k].value.skills[i].name === filterParams.skills[j].name) {
                                        if (filterParams.skills[j].name == 0 || filterParams.skills[j].name == 4) {
                                            if (filterParams.skills[j].value === response.rows[k].value.skills[i].value) {
                                                flag = true;
                                            }
                                        } else if (response.rows[k].value.skills[i].value >= filterParams.skills[j].value) {
                                            flag = true;
                                        }
                                    }
                                };
                            } else {
                                break;
                            }
                        };
                        if (flag == false) {
                            continue;
                        }
                    }
                    result.push(response.rows[k].value);
                };
                return result;
            }).otherwise(function(err) {
                console.log(err);
            });
        }
    });

    function sync(db, remoteCouch) {
        db.sync(remoteCouch, {
            live: true
        }).on("error", function() {
            console.error("Syncing with CouchDb failed. Will attemp reconect in 5 seconds.");
            setTimeout(function() {
                sync(db, remoteCouch);
            }, 5000);
        });
    }

    var db = new PouchDB("imops");
    var remoteCouch = "http://localhost:5984/imops";
    sync(db, remoteCouch);

    return new PouchStore({
        db: db
    });

});