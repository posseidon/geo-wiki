class Addenddatumtogeotag < ActiveRecord::Migration
  def self.up
    add_column :geotags, :edatum, :datetime
    add_column :geotags, :title, :string
  end

  def self.down
    remove_column :geotags, :title
    remove_column :geotags, :edatum
  end
end
