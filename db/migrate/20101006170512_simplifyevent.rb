class Simplifyevent < ActiveRecord::Migration
  def self.up
    remove_column :events, :location
    remove_column :events, :datum
  end

  def self.down
    add_column :events, :datum
    add_column :events, :location
  end
end
