import DS from "ember-data";

/**
 * Relationship Model
 * 
 * @module
 * @extends ember-data/Model
 */
export default DS.Model.extend({
    relationship_type: DS.attr("string"),
    source_ref: DS.attr("string"),
    target_ref: DS.attr("string")
});
