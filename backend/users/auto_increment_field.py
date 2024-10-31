# auto_increment_field.py
from django.db import models
from pymongo import MongoClient

class AutoIncrementField(models.IntegerField):
    def __init__(self, *args, **kwargs):
        self.sequence_name = kwargs.pop('sequence_name', None)
        super(AutoIncrementField, self).__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        if not getattr(model_instance, self.attname):
            # Connect to your MongoDB instance
            client = MongoClient('mongodb://localhost:27017/')  # Update with your MongoDB connection string
            db = client['Inventory']  # Replace with your database name
            counter = db['counters']

            # Increment the counter
            seq_doc = counter.find_one_and_update(
                {'sequence_name': self.sequence_name},
                {'$inc': {'sequence_value': 1}},
                upsert=True,
                return_document=True
            )

            # Set the incremented value
            model_instance.__setattr__(self.attname, seq_doc['sequence_value'])
        return super(AutoIncrementField, self).pre_save(model_instance, add)
