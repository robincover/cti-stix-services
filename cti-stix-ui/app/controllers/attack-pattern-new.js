import Ember from "ember";
import AddRemoveExternalReferences from "../mixins/add-remove-external-references";
import AddRemoveKillChainPhases from "../mixins/add-remove-kill-chain-phases";

/**
 * Attack Pattern New Controller responsible for creating Attack Pattern records
 * 
 * @module
 * @extends ember/Controller
 */
export default Ember.Controller.extend(AddRemoveExternalReferences, AddRemoveKillChainPhases, {
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
            let itemRecord = store.createRecord("attack-pattern", item);
            let promise = itemRecord.save();

            let self = this;
            promise.then(function() {
                self.transitionToRoute("attack-patterns");
            });
            promise.catch(function(error) {
                var alert = {
                    label: "Save Failed",
                    error: error
                };
                self.set("model.alert", alert);
            });
        }
    }
});