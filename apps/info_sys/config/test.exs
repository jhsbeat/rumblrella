use Mix.Config

import_config "test.secret.exs"

config :info_sys, :wolfram, http_client: InfoSys.Test.HTTPClient