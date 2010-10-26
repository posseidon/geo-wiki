class Event < ActiveRecord::Base
  belongs_to :article
  has_many :geotags
end
