defmodule Rumbl.Contents.Category do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Rumbl.Contents.Category


  schema "categories" do
    field :name, :string
    has_many :videos, Rumbl.Contents.Video

    timestamps()
  end

  @doc false
  def changeset(%Category{} = category, attrs) do
    category
    |> cast(attrs, [:name])
    |> validate_required([:name])
    # |> foreign_key_constraint(:videos, name: :videos_category_id_fkey, message: "still exist")
  end

  def alphabetical(query) do
    from c in query, order_by: c.name
  end

  def names_and_ids(query) do
    from c in query, select: {c.name, c.id}
  end
    
end
