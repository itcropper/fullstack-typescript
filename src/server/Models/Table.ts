
import { Schema, model, Document, Model } from 'mongoose';

export interface ITableModel extends Document {
	name?: string,
	link?: string,
	description?: string,
	is_private?: boolean,
	author_id?: { type: string, index: true },
	created?: Date,
	expires?: Date,
	tags?: string[]
}

export const TableSchema: Schema = new Schema({
	name: String,
	link: String,
	description: String,
	is_private: Boolean,
	author_id: { type: String, index: true },
	created: Date,
	expires: Date,
	tags: [String],
});

TableSchema.pre('save', function (next) {

	var event = <any>this;

	if (!event.created) {
		event.created = new Date();
	}
	return next();
});


export const Table: Model<ITableModel> = model<ITableModel>("Table", TableSchema);
	  