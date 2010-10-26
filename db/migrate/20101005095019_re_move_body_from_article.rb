class ReMoveBodyFromArticle < ActiveRecord::Migration
  def self.up
    remove_column :articles, :body
  end

  def self.down
    add_column :artciles, :body
  end
end
