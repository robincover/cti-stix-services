import Ember from "ember";
import DeleteObjectAction from "../mixins/delete-object-action";

/**
 * Attack Patterns Controller handles grouping and deletion of records
 * 
 * @module
 * @extends ember/Controller
 */
export default Ember.Controller.extend(DeleteObjectAction, {
    queryParams: ["deleteObjectId", "alertObjectId"],

    attackPatternService: Ember.inject.service("attack-pattern"),

    /**
     * Phase Name Groups observes model.items and returns grouped Attack Patterns
     * 
     * @function
     * @returns {Object} Attack Patterns group based on Kill Chain Phase Name
     */
    phaseNameGroups: Ember.computed("model.items.[]", function() {
        const attackPatterns = this.get("model.items");
        return this.get("attackPatternService").getPhaseNameGroups(attackPatterns);
    })
});