import { useMachine } from "@ui-machines/react"
import * as Tabs from "@ui-machines/tabs"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"
import { tabsData } from "../../../shared/data"

export default function Page() {
  const controls = useControls({
    manual: { type: "boolean", defaultValue: false, label: "manual?" },
    loop: { type: "boolean", defaultValue: true, label: "loop?" },
  })
  const [state, send] = useMachine(Tabs.machine.withContext({ value: "nils" }), {
    context: {
      activationMode: controls.context.manual ? "manual" : "automatic",
      loop: controls.context.loop,
    },
  })

  const ref = useMount<HTMLDivElement>(send)

  const { getTabProps, getTabPanelProps, tablistProps, tabIndicatorProps } = Tabs.connect(state, send)

  return (
    <div style={{ width: "100%" }}>
      <controls.ui />
      <div className="tabs">
        <div className="tabs__indicator" {...tabIndicatorProps} />
        <div ref={ref} {...tablistProps}>
          {tabsData.map((data) => (
            <button {...getTabProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
              {data.label}
            </button>
          ))}
        </div>
        {tabsData.map((data) => (
          <div {...getTabPanelProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
            <p>{data.content}</p>
          </div>
        ))}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
