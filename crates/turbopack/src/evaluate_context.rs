use turbo_tasks::Value;
use turbopack_core::{
    compile_time_defines,
    compile_time_info::CompileTimeInfo,
    context::AssetContextVc,
    environment::{EnvironmentIntention, EnvironmentVc, ExecutionEnvironment, NodeJsEnvironment},
    resolve::options::ImportMapVc,
};

use crate::{
    module_options::ModuleOptionsContext, resolve_options_context::ResolveOptionsContext,
    transition::TransitionsByNameVc, ModuleAssetContextVc,
};

#[turbo_tasks::function]
pub fn node_evaluate_asset_context(
    import_map: Option<ImportMapVc>,
    transitions: Option<TransitionsByNameVc>,
) -> AssetContextVc {
    ModuleAssetContextVc::new(
        transitions.unwrap_or_else(|| TransitionsByNameVc::cell(Default::default())),
        CompileTimeInfo {
            environment: EnvironmentVc::new(
                Value::new(ExecutionEnvironment::NodeJsBuildTime(
                    NodeJsEnvironment::default().cell(),
                )),
                Value::new(EnvironmentIntention::Build),
            ),
            defines: compile_time_defines!(
                process.turbopack = true,
                process.env.NODE_ENV = "development",
            )
            .cell(),
        }
        .cell(),
        ModuleOptionsContext {
            enable_typescript_transform: true,
            ..Default::default()
        }
        .cell(),
        ResolveOptionsContext {
            enable_typescript: true,
            enable_node_modules: true,
            enable_node_externals: true,
            enable_node_native_modules: true,
            custom_conditions: vec!["development".to_string(), "node".to_string()],
            import_map,
            ..Default::default()
        }
        .cell(),
    )
    .as_asset_context()
}
