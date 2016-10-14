import Ember from "ember";

/**
 * Threat Actors New Controller handles creation of records
 * 
 * @module
 * @extends ember/Controller
 */
export default Ember.Controller.extend({
    /** @type {Object} */
    actions: {
        /**
         * Save Item to Store
         * 
         * @function actions:save
         * @param {Object} item Object to be created
         * @returns {undefined}
         */
        save(item) {
            const externalReferences = Ember.get(item, "external_references");
            externalReferences.forEach(function(externalReference) {
                let invalid = true;
                if (Ember.isPresent(externalReference.source_name)) {
                    if (Ember.isPresent(externalReference.external_id)) {
                        invalid = false;
                    }
                }
                if (invalid) {
                    externalReferences.removeObject(externalReference);
                }
            });

            let store = this.get("store");
            let itemRecord = store.createRecord("threat-actor", item);
            let promise = itemRecord.save();

            let self = this;
            promise.then(function() {
                self.transitionToRoute("threat-actors");
            });
            promise.catch(function(error) {
                var alert = {
                    label: "Save Failed",
                    error: error
                };
                self.set("model.alert", alert);
            });
        },

        /**
         * Add Alias object to array for editing
         * 
         * @function actions:addAlias
         * @param {Object} item Object to be created
         * @returns {undefined}
         */
        addAlias(item) {
            let aliases = Ember.get(item, "aliases");
            let alias = {
                alias: undefined
            };
            aliases.pushObject(alias);
        },

        /**
         * Remove Alias object from array
         * 
         * @function actions:removeAlias
         * @param {Object} alias Object to be removed
         * @returns {undefined}
         */
        removeAlias(alias) {
            const aliases = this.get("model.item.aliases");
            aliases.removeObject(alias);
        }
    }
});