class Article < ActiveRecord::Base
  has_many :events
  
  def self.search(search)
    if search
      find(:all, :conditions => ['title LIKE ?', "%#{search}%"])
    else
      return nil
    end
  end
  
  def self.find_by_title(title)
    if title
      find(:first, :conditions => ['title = ?', title.strip])
    end
  end
  
  def self.to_timeline(id)
    @xml = "{'events':[{"
    # Content
    @article = Article.where(:id => id).first
    for event in @article.events do
      for geotag in event.geotags do
        @xml.concat("{ 'start': \"")
        @xml.concat(geotag.datum.strftime("%Y-%m-%d"))
        @xml.concat("\", 'title':")
        @xml.concat(geotag.location)
        @xml.concat("\", 'description': \"")
        @xml.concat(geotag.description)
        @xml.concat("\"},")
      end
    end
    @xml.concat("{}]}}")
  end

end
