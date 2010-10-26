class Addlocationtogeotag < ActiveRecord::Migration
  def self.up
    add_column :geotags, :address, :string
  end

  def self.down
    remove_column :geotags, :address
  end
end
