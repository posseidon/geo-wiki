class Addgeotagstable < ActiveRecord::Migration
  def self.up
    create_table :geotags do |t|
      t.integer  :event_id
      t.datetime :datum
      t.string   :location
      t.string   :description
      
      t.timestamps
    end

  end

  def self.down
    drop_table :geotags
  end
end
