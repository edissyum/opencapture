ALTER TABLE mailcollect ADD COLUMN "copy_custom_id" INTEGER DEFAULT NULL;
ALTER TABLE mailcollect ADD COLUMN "sender_custom_id" INTEGER DEFAULT NULL;
ALTER TABLE mailcollect ADD COLUMN "recipient_custom_id" INTEGER DEFAULT NULL;