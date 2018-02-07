defmodule Rumbl.Contents.Annotation do
  use Ecto.Schema
  import Ecto.Changeset
  alias Rumbl.Contents.Annotation


  schema "annotations" do
    field :at, :integer
    field :body, :string
    belongs_to :user, Rumbl.Accounts.User
    belongs_to :video, Rumbl.Contents.Video

    timestamps()
  end

  @required [:body, :at, :video_id, :user_id]
  @optional []

  @doc false
  def changeset(%Annotation{} = annotation, attrs) do
    annotation
    |> cast(attrs, @required ++ @optional)
    |> validate_required(@required)
  end
end
