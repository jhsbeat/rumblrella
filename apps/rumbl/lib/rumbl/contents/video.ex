defmodule Rumbl.Contents.Video do
  use Ecto.Schema
  import Ecto.Changeset
  alias Rumbl.Contents.Video

  @primary_key {:id, Rumbl.Permalink, autogenerate: true}
  schema "videos" do
    field :description, :string
    field :title, :string
    field :url, :string
    field :slug, :string
    belongs_to :user, Rumbl.Accounts.User
    belongs_to :category, Rumbl.Contents.Category
    has_many :annotations, Rumbl.Contents.Annotation

    timestamps()
  end

  @required [:user_id, :url, :title, :description]
  @optional [:category_id]

  @doc false
  def changeset(%Video{} = video, attrs) do
    video
    |> cast(attrs, @required ++ @optional)
    |> validate_required(@required)
    |> slugify_title()
    |> assoc_constraint(:category)
  end

  defp slugify_title(changeset) do
    if title = get_change(changeset, :title) do
      put_change(changeset, :slug, slugify(title))
    else
      changeset
    end
  end

  defp slugify(str) do
    str
    |> String.downcase()
    |> String.replace(~r/[^\w-]+/u, "-")
  end

  defimpl Phoenix.Param do
    def to_param(%Video{slug: slug, id: id}) do
      "#{id}-#{slug}"
    end
  end
end
