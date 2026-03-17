"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#E4E8E6] bg-white text-sm text-[#6B726F]">
          Chart unavailable
        </div>
      );
    }
    return this.props.children;
  }
}
