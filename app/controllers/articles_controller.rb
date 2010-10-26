class ArticlesController < ApplicationController
  layout 'articlemain'
  
  #
  # View Methods.
  #
  def index
    @articles = Article.find(:all, :limit => 10)
    @recent = Article.limit(5).order('updated_at DESC')
    @fresh = Article.limit(5).order('created_at DESC')
    if params[:q]
      @result = Article.search(params[:q])
      @query = params[:q]
    end
  end
  
  #
  # Show Selected Article.
  #
  def show
    @article = Article.find(params[:id])
  end
  
  #
  # Adding new Article.
  #
  def new
    
  end
  
  def create
    @article = Article.new(params[:article])
    if @article.save
      redirect_to :action => 'edit', :id => @article.id
    else
      redirect_to :action => 'index'
    end
  end
  
  #
  # Editing Article.
  #
  def edit
    if request.get?
      @article = Article.find(params[:id])
    else
      if params[:id]
        @article = Article.find(params[:id])
        @article[params['elementid']] = params['value']
        @article.save
      end
      render :text => @article[params['elementid']]
    end
  end
  
  def addevent
    if params[:event]
      @event = Event.new(params[:event])
      @event.body = (@event.body).gsub(/[\t\n\r]/,"").gsub(/\\r/,"").squeeze
      if @event.save
        @articles = Article.find(params[:id])
        @articles.events << @event
        @articles.save
        redirect_to :action => 'edit', :id => params[:id]
      else
        redirect_to :action => 'index'
      end
    end
  end
  
  def edit_event
    @article = Article.find(params[:id])
    @event = Event.find(params[:event_id])
  end
  
  def update_event
    @event = Event.find(params[:event_id])
    @event.update_attributes(params[:event])
    redirect_to :action => 'edit', :id => params[:id]
  end

  #
  # Navigating to GeoTag Page.
  #
  def geotag
    @article = Article.find(params[:id])
    @event = Event.find(params[:event_id])
    @tags = "<markers>"
    @geotags = @event.geotags
    @geotags.each do |tag|
      @tags.concat(tag.to_xml(:skip_instruct => true, :except => [ :id, :event_id, :created_at, :updated_at, :datum]))
    end
    @tags.concat("</markers>")
    
    render :layout => 'map'
  end
  
  #
  # Saving GeoTag Data.
  #
  def save_geotag
    @geotag = Geotag.new(params[:geotag])
    @geotag.description = (@geotag.description).gsub(/[\t\n\r]/,"").gsub(/\\r/,"").squeeze
    p @geotag.description
    @geotag.save
    @event = Event.find(params[:event_id])
    @event.geotags << @geotag
    @event.save
    redirect_to :action => 'geotag', :id => params[:id], :event_id => params[:event_id]
  end
  
  #
  # Map View of Current Article
  #
  def map_view
    @article = Article.find(params[:id])
    @events =  @article.events
    @tags = ""
    @selected = []
    if params[:event]
      @geo_events = Event.find(:all, :conditions => { :id => params[:event] })
      # Load Tags
      @tags.concat("<markers>");
      for event in @geo_events do
        @selected.push(event.id)
        @tags.concat(pack_to_xml(event.geotags))
      end
      @tags.concat("</markers>")
      p @tags
    end
    render :layout => 'map'
  end
  
  def timeliner
    @article = Article.find(params[:article_id])
    @events = @article.events
    @startdate = Geotag.minimum(:datum)
    render :layout => 'tline'
  end
  
  private
  def pack_to_xml(geotags)
    @data = ""
    geotags.each do |tag|
      @data.concat(tag.to_xml(:skip_instruct => true, :except => [ :id, :event_id, :created_at, :updated_at, :datum]))
    end
    return @data
  end
  
end
