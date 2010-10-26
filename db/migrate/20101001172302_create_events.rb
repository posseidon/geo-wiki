class CreateEvents < ActiveRecord::Migration
  def self.up
    create_table :events do |t|
      t.integer :article_id
      t.string :title
      t.text :body
      t.date :datum
      t.string :location

      t.timestamps
    end
  end

  def self.down
    drop_table :events
  end
end
