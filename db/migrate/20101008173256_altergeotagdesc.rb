class Altergeotagdesc < ActiveRecord::Migration
  def self.up
    change_table :geotags do |t|
      t.change :description, :text
    end
  end

  def self.down
    change_table :geotags do |t|
      t.change :description, :string
    end
  end
end
